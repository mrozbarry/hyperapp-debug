import * as subscriptionHelper from './helpers/subscription';
import listener from './helpers/listener';
import * as dispatchHelper from './helpers/dispatch';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const randId = () => Math.random().toString(36).slice(2);

export default app => (props) => {
  let dispatch = null;
  const appId = randId();
  const appName = props.debugName || appId;

  const emit = (eventName, type, payload, id) => {
    const detail = {
      type,
      payload: JSON.parse(JSON.stringify(payload)),
      appId,
      appName,
      id,
    };
    console.log('emit', detail);
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  };


  const emitDevtoolMessage = (type, message, id) => {
    emit(APP_TO_DEVTOOL, type, message || {}, id);
  };

  const emitPanelMessage = (type, message = {}) => {
    emit(APP_TO_PANEL, type, message);
  };

  emitPanelMessage('query');
  emitDevtoolMessage('init');

  let dispatchHistory = {};
  const middleware = originalDispatch => {
    dispatch = originalDispatch;

    return (action, props) => {
      const id = [
        performance.now(),
        appId,
        randId(),
      ].join('_');

      dispatchHistory[id] = { action, props };

      const serialized = dispatchHelper.serialize(action, props);
      return emitDevtoolMessage('dispatch', serialized, id);
    };
  };

  const onDevToolDispatch = (message) => {
    if (message.appId !== appId) {
      return;
    }

    const item = dispatchHistory[message.id];
    return item
      ? dispatch(item.action, item.props)
      : null;
  };

  const onDevToolShown = () => {
    emitDevtoolMessage('register', {
      appId,
      appName,
    });
  };

  const devToolMessageHandler = {
    'dispatch': onDevToolDispatch,
    'panel-shown': onDevToolShown,
  };

  const cancelDevToolListener = listener(DEVTOOL_TO_APP, (event) => {
    const message = JSON.parse(event.detail);
    const handler = devToolMessageHandler[message.type];
    console.log('devToolListener.message', message, handler);
    if (!handler) {
      return console.warn('no handler for', message.type, message);
    }
    handler(message);
  });

  const subscriptions = subscriptionHelper.wrap(props.subscriptions, (subEvents) => {
    console.log('subscriptionHeplper.subEvents', subEvents);
    emitDevtoolMessage('subscriptions', subEvents);
  });

  const appSignature = {
    ...props,
    subscriptions,
    middleware,
  };

  app(appSignature);
  return () => {
    cancelDevToolListener();
  };
};
