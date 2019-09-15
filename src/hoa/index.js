import { recordSubEvents, flattenSubs } from './helpers/subscription';
import { makeEvents } from './helpers/events';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';


export const middleware = (appStart, emitDebugMessage) => dispatch => {
  return (action, props) => {
    const happenedAt = Date.now() - appStart;

    const events = makeEvents(action, props)
      .map(e => ({ ...e, happenedAt }))

    emitDebugMessage('events', events);

    return dispatch(action, props);
  };
};

const isEventsWithAction = (type, message) => type === 'events' && message.some(m => m.type === 'action');
const isEventsWithCommit = (type, message) => type === 'events' && message.some(m => m.type === 'commit');

export const debug = app => (props) => {
  const appStart = Date.now();

  let pendingAction = null;

  const emitDebugMessage = (type, message) => {
    if (isEventsWithAction(type, message)) {
      pendingAction = message.find(m => m.type === 'action');
      message = message.filter(m => m.type !== 'action');
      return;
    } else if (isEventsWithCommit(type, message)) {
      message = message.map((event) => {
        if (event.type !== 'commit') {
          return event;
        }
        return { ...pendingAction, state: event.state };
      });
      pendingAction = null;
    }

    const event = new CustomEvent(
      APP_TO_DEVTOOL, {
        detail: { target: 'devtool', type, payload: JSON.parse(JSON.stringify(message)) },
      },
    )
    window.dispatchEvent(event);
  };

  const onDevtoolMessage = (event) => {
    const message = event.detail;
    console.log('[FROM DEV TOOL]', message);
  };

  window.addEventListener(DEVTOOL_TO_APP, onDevtoolMessage);

  window.addEventListener('beforeunload', () => {
    emitDebugMessage('message', { action: 'page-unload' });
  });

  const outerMiddleware = props.middleware || (dispatch => dispatch);

  let subscriptions = undefined;
  if (props.subscriptions) {
    let prevSubs = [];
    subscriptions = state => {
      const happenedAt = Date.now() - appStart;

      const subs = props.subscriptions(state);
      const flattened = flattenSubs([...subs]);
      const events = recordSubEvents(prevSubs, flattened)
        .map(e => ({ ...e, happenedAt }))
      emitDebugMessage('events', events)
      prevSubs = flattened;
      
      return subs;
    };
  }

  const kill = app({
    ...props,
    subscriptions,
    middleware: dispatch => outerMiddleware(middleware(appStart, emitDebugMessage)(dispatch)),
  });

  return () => {
    window.removeEventListener(DEVTOOL_TO_APP, onDevtoolMessage);
    kill();
  };
};
