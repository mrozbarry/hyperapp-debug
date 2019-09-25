import { recordSubEvents } from './helpers/subscription';
import { flattenEffects } from './helpers/flattenEffects';
import { raw } from './effects/messageDevTool';
import * as dispatchHelper from './helpers/dispatch';

export const debug = app => (props) => {
  let dispatch = null;
  const devToolsConfig = typeof window.hyperappDevTool === 'function' && JSON.parse(window.hyperappDevTool());
  if (!devToolsConfig) {
    console.warn(`It looks like you haven't install the Hyperapp Devtools Extension/Addon, but are using the debug app wrapper.
For now, you'll be using the regular app function. Once you install the extension, you'll get access to the time travel debugger.

You can get the latest versions from https://github.com/LearnHyperapp/hyperapp-devtools/releases
`);
    return app(props);
  }
  const { APP_TO_DEVTOOL, APP_TO_PANEL, DEVTOOL_TO_APP } = devToolsConfig.events;

  const emitDevtoolMessage = (type, message = {}) => {
    raw(APP_TO_DEVTOOL, type, message);
  };

  const emitPanelMessage = (type, message = {}) => {
    raw(APP_TO_PANEL, type, message);
  };

  emitPanelMessage('query');
  emitDevtoolMessage('init');

  const middleware = originalDispatch => {
    dispatch = originalDispatch;

    return (action, props) => {
      const serialized = dispatchHelper.serialize(action, props);
      return emitDevtoolMessage('dispatch', serialized);
    };
  };

  const DevToolSub = () => {
    const onDevtoolMessage = (event) => {
      const message = JSON.parse(event.detail);
      console.log('onDevtoolMessage', message);
      switch (message.type) {
      case 'dispatch': {
        const deserialized = dispatchHelper.deserialize(message.payload);
        return dispatch(deserialized.action, deserialized.props);
      }

      case 'init':
      case 'subscriptions':
        break;

      default:
        console.log('Unable to process devtool message', message);
        return;
      }
    };

    window.addEventListener(DEVTOOL_TO_APP, onDevtoolMessage, false);

    return () => {
      window.removeEventListener(DEVTOOL_TO_APP, onDevtoolMessage);
    };
  };

  let prevSubs = [];
  const subscriptions = state => {
    const subs = props.subscriptions
      ? props.subscriptions(state)
      : [];

    const flattened = flattenEffects([...subs]);
    const subEvents = recordSubEvents(prevSubs, flattened);
    emitDevtoolMessage('subscriptions', subEvents);
    prevSubs = flattened;

    return subs;
  };

  const cancelDevToolSub = DevToolSub();

  const appSignature = {
    ...props,
    subscriptions,
    middleware,
  };

  app(appSignature);
  return () => {
    cancelDevToolSub();
  };
};
