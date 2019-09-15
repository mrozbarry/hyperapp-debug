import { recordSubEvents } from './helpers/subscription';
import { flattenEffects } from './helpers/flattenEffects';
import { makeEvents } from './helpers/events';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';


export const middleware = (emitDebugMessage) => dispatch => {
  return (action, props) => {
    const events = makeEvents(action, props)

    emitDebugMessage('events', events);

    return dispatch(action, props);
  };
};

const isEventsWithAction = (type, message) => type === 'events' && message.some(m => m.type === 'action');
const isEventsWithCommit = (type, message) => type === 'events' && message.some(m => m.type === 'commit');

export const debug = app => (props) => {
  let eventIndex = 0;

  let eventsBuffer = [];
  const queueEvents = (type, message) => {
    if (type !== 'events') {
      return emitDebugMessage(type, message);
    }

    eventsBuffer = eventsBuffer.concat(message);
  };

  const flushEvents = () => {
    emitDebugMessage('events', eventsBuffer);
    eventsBuffer = [];
  };

  const emitDebugMessage = (type, message) => {
    const event = new CustomEvent(
      APP_TO_DEVTOOL, {
        detail: { target: 'devtool', type, eventIndex, payload: JSON.parse(JSON.stringify(message)) },
      },
    )
    window.dispatchEvent(event);
    if (type === 'events') {
      eventIndex += 1;
    }
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

  let prevSubs = [];
  const subscriptions = state => {
    const subs = props.subscriptions
      ? props.subscriptions(state)
      : [];

    const flattened = flattenEffects([...subs]);
    const events = recordSubEvents(prevSubs, flattened)
    queueEvents('events', events)
    flushEvents();
    prevSubs = flattened;

    return subs;
  };

  const kill = app({
    ...props,
    subscriptions,
    middleware: dispatch => outerMiddleware(middleware(queueEvents)(dispatch)),
  });

  return () => {
    window.removeEventListener(DEVTOOL_TO_APP, onDevtoolMessage);
    kill();
  };
};
