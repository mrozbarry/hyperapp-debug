import { recordSubEvents } from './helpers/subscription';
import { flattenEffects } from './helpers/flattenEffects';
import { raw } from './effects/messageDevTool';
import * as dispatchHelper from './helpers/dispatch';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

// const devtoolStyles = `
// .hyperapp-devtools-container {
//   position: absolute;
//   bottom: 2px;
//   right: 2px;
//   background-color: red;
//   color: white;
//   font-size: 12px;
//   font-family: sans-serif;
//   padding: 2px;
// }
//
// .hyperapp-devtools-container:hover {
//   opacity: 0.1;
// }
// `;
//
// const injectStylesheet = () => {
//   const prev = document.head.querySelector('style#hyperapp-dev-tools');
//   if (prev) return;
//   const styleTag = document.createElement('style');
//   styleTag.type = 'text/css';
//   styleTag.id = 'hyperapp-dev-tools';
//   styleTag.innerText = devtoolStyles;
//   document.head.appendChild(styleTag);
// };
//
// const showMessage = (html) => {
//   const container = document.createElement('div');
//   container.className = 'hyperapp-devtools-container';
//   container.innerHTML = html;
//   document.body.appendChild(container);
//   return container;
// }
//
// const showPaused = () => {
//   return showMessage(`❚❚ App Paused`);
// };

export const debug = app => (props) => {
  // injectStylesheet();
  let dispatch = null;

  const emitDevtoolMessage = (type, message = {}) => {
    raw(APP_TO_DEVTOOL, type, message);
  };

  const emitPanelMessage = (type, message = {}) => {
    raw(APP_TO_PANEL, type, message);
  };

  emitPanelMessage('use-hyperapp-devtool');
  emitDevtoolMessage('init');

  const middleware = originalDispatch => {
    dispatch = originalDispatch

    return (action, props, source) => {
      if (!source) {
        const serialized = dispatchHelper.serialize(action, props);
        return emitDevtoolMessage('dispatch', serialized);
      }
      return dispatch(action, props, source);
      // const deserialized = dispatchHelper.deserialize(serialized);
      // dispatch(deserialized.action, deserialized.props);
      // return originalDispatch(Noop, {});
    };
  };

  const DevToolSub = (_dispatch, props) => {
    const onDevtoolMessage = (event) => {
      const message = event.detail;
      console.log('[DevToolSub]', message.type, message.payload);
      switch (message.type) {
        case 'dispatch': {
          const deserialized = dispatchHelper.deserialize(message.payload);
          return dispatch(deserialized.action, deserialized.props, 'devtool');
        }

        default:
          console.log('Unabled devtool message', message);
          return;
      }
    };

    window.addEventListener(props.eventName, onDevtoolMessage);

    return () => {
      window.removeEventListener(props.eventName, onDevtoolMessage);
    };
  };

  const devToolSub = (props = {}) => [DevToolSub, props];

  let prevSubs = [];
  const subscriptions = state => {
    const subs = props.subscriptions
      ? props.subscriptions(state)
      : [];

    const flattened = flattenEffects([...subs]);
    // const subEvents = recordSubEvents(prevSubs, flattened)
    // emitDevtoolMessage('sub:events', subEvents);
    prevSubs = flattened;

    return subs.concat([
      devToolSub({ eventName: DEVTOOL_TO_APP }),
    ]);
  };

  const kill = app({
    ...props,
    subscriptions,
    middleware,
  });

  return () => {
    kill();
  };
};
