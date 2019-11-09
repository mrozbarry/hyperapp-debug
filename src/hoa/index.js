import * as subscriptionHelper from './helpers/subscription';
import listener from './helpers/listener';
import * as dispatchHelper from './helpers/dispatch';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';
const REGISTER_TO_APP = '$hyperapp-register-to-app';
const REGISTER_TO_CONTENTSCRIPT = '$hyperapp-register-to-contentscript';

const randId = () => Math.random().toString(36).slice(2);

const waitForDebugSignal = () => new Promise((resolve, reject) => {
  let timeout = null;

  const receiveSignal = () => {
    cleanup(resolve);
  };

  const cleanup = (callback) => {
    clearTimeout(timeout);
    window.removeEventListener(REGISTER_TO_APP, receiveSignal);
    callback();
  };

  window.addEventListener(REGISTER_TO_APP, receiveSignal, true);
  const event = new CustomEvent(REGISTER_TO_CONTENTSCRIPT);
  window.dispatchEvent(event);

  timeout = setTimeout(cleanup, 2000, () => {
    console.warn('Unable to detect HyperappDebug extension');
    return reject();
  });
});

export default app => (props) => {
  let dispatch = null;
  const appId = randId();
  const appName = props.debugName || appId;
  let dispatchHistory = {};

  const emit = (eventName, type, payload, id) => {
    const detail = {
      type,
      payload: JSON.parse(JSON.stringify(payload)),
      appId,
      appName,
      id,
    };
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  };

  const emitDevtoolMessage = (type, message, id) => {
    emit(APP_TO_DEVTOOL, type, message || {}, id);
  };

  const emitPanelMessage = (type, message) => {
    emit(APP_TO_PANEL, type, message || {}, null);
  };


  const dispatchToDevtool = (action, props) => {
    const id = [
      performance.now(),
      appId,
      randId(),
    ].join('_');

    dispatchHistory[id] = { action, props };

    const serialized = dispatchHelper.serialize(action, props);
    return emitDevtoolMessage('dispatch', serialized, id);
  };

  const middleware = originalDispatch => {
    dispatch = originalDispatch;

    return (action, props) => {
      //if (!hasDevtool) {
        //return originalDispatch(action, props);
      //}
      return dispatchToDevtool(action, props);
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
    emitDevtoolMessage('register');
  };

  //const onDevToolMeta = () => {
    //hasDevtool = true;
    //clearTimeout(devtoolTimeout);
  //};

  const onDevToolHistory = () => {
    //const keys = Object.keys(dispatchHistory); //.sort((a, b) => toSortable(a) - toSortable(b));
    //for(const key of keys) {
      //const { action, props } = dispatchHistory[key];
      //dispatchToDevtool(action, props, { isHistory: true });
    //}
  };

  const devToolMessageHandler = {
    'dispatch': onDevToolDispatch,
    'panel-shown': onDevToolShown,
    // 'meta': onDevToolMeta,
    'history': onDevToolHistory,
  };

  const cancelDevToolListener = listener(DEVTOOL_TO_APP, (event) => {
    const message = JSON.parse(event.detail);
    const handler = devToolMessageHandler[message.type];
    if (!handler) {
      return console.warn('no handler for', message.type, message);
    }
    handler(message);
  });

  const subscriptions = subscriptionHelper.wrap(props.subscriptions, (subEvents) => {
    emitDevtoolMessage('subscriptions', subEvents);
  });

  const appSignature = {
    ...props,
    subscriptions,
    middleware,
  };

  window.addEventListener('unload', () => {
    emitDevtoolMessage('deregister');
  });

  emitPanelMessage('query');

  return waitForDebugSignal()
    .then(() => app(appSignature))
    .catch(() => {
      app(appSignature);
      return () => {
        emitDevtoolMessage('deregister');
        cancelDevToolListener();
      };
    });
};
