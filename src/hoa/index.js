import { recordSubEvents } from './helpers/subscription';
import { flattenEffects } from './helpers/flattenEffects';
import { makeEvents } from './helpers/events';
import * as eventBuffer from './helpers/eventBuffer';
import { raw } from './effects/messageDevTool';
import { h } from 'hyperapp';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const devtoolStyles = `
.hyperapp-devtools-container {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: red;
  color: white;
  font-size: 12px;
  font-family: sans-serif;
  padding: 2px;
}

.hyperapp-devtools-container:hover {
  opacity: 0.1;
}
`;

const injectStylesheet = () => {
  const prev = document.head.querySelector('style#hyperapp-dev-tools');
  if (prev) return;
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';
  styleTag.id = 'hyperapp-dev-tools';
  styleTag.innerText = devtoolStyles;
  document.head.appendChild(styleTag);
};

const showPaused = () => {
  const container = document.createElement('div');
  container.className = 'hyperapp-devtools-container';
  container.innerHTML = `❚❚ App Paused`;
  document.body.appendChild(container);
  return container;
};

export const debug = app => (props) => {
  injectStylesheet();

  let eventIndex = 0;
  let pausedDiv = null;
  let freeze = false;

  (void eventBuffer.flush());

  const emitDebugMessage = (type, message) => {
    if (freeze) {
      return;
    }
    raw(APP_TO_DEVTOOL, type, eventIndex, message);
  };

  raw(APP_TO_PANEL, 'use-hyperapp-devtool', eventIndex, {});
  emitDebugMessage(APP_TO_DEVTOOL, 'init', eventIndex, {});

  class NoFreeze {
    constructor(message) {
      this.message = message;
    }
  }
  const avoidFreeze = message => new NoFreeze(message);
  const avoidsFreeze = message => message instanceof NoFreeze;

  const middleware = dispatch => {
    return (action, props) => {
      if (avoidsFreeze(action)) {
        return dispatch(action.message, props);
      } else if (!freeze) {
        eventBuffer.push(makeEvents(action, props));

        return dispatch(action, props);
      }
    };
  };

  const devToolMessageHandlers = {
    'set-state': (dispatch, message) => {
      dispatch(avoidFreeze(message.payload.state));
      if (!freeze) {
        freeze = true;
        pausedDiv = showPaused();
      }

    },
    'unfreeze': (_dispatch, _message) => {
      freeze = false;
      pausedDiv.remove();
      pausedDiv = null;
    },
  };

  const DevToolSub = (dispatch, props) => {
    const onDevtoolMessage = (event) => {
      const message = event.detail;
      const handler = devToolMessageHandlers[message.type];
      if (!handler) {
        return console.log('[FROM DEV TOOL]', message);
      }
      handler(dispatch, message);
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
    if (!freeze) {
      eventBuffer.push(recordSubEvents(prevSubs, flattened))
      emitDebugMessage('events', eventBuffer.flush());
      eventIndex += 1;
    }
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
