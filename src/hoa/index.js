import * as subscriptionHelper from './helpers/subscription';
import * as dispatchHelper from './helpers/dispatch';
import devtoolBridge from './bridge/devtool';

const randId = () => Math.random().toString(36).slice(2);

export default app => (props) => {
  let dispatch = null;
  const appId = randId();
  const appName = props.debugName || appId;
  const bridge = (props.bridge || devtoolBridge)(appId, appName);
  let dispatchHistory = {};
  let importHistory = [];
  let isBeingDebugged = false;

  const addImportHistory = (id, type, payload) => {
    if (dispatchHistory[id]) {
      console.log('skipping history add, already in dispatchHistory', id);
      return;
    }
    const item = {
      id,
      appId,
      type,
      payload,
    };
    importHistory.push(item);
    console.log('adding import history', { item });

  };

  const middleware = originalDispatch => {
    dispatch = originalDispatch;

    return (action, props) => {
      console.log('Running dispatch', { action, props });
      const serialized = dispatchHelper.serialize(action, props);
      const id = bridge.emit('dispatch', serialized);
      addImportHistory(id, 'dispatch', serialized);
      dispatchHistory[id] = { action, props };
      if (!isBeingDebugged) {
        dispatch(action, props);
      }
    };
  };

  const onDevToolDispatch = (message) => {
    const item = dispatchHistory[message.id];
    return item
      ? dispatch(item.action, item.props)
      : null;
  };

  const onDevToolUse = (message) => {
    isBeingDebugged = message.appId === appId;
    console.log(`${message.payload.appName} (${message.appId}) is now being debugged`, { isBeingDebugged, appId });
    if (isBeingDebugged) {
      bridge.emit('import', importHistory);
    }
  };

  const devToolMessageHandler = {
    'dispatch': onDevToolDispatch,
    'use': onDevToolUse,
  };

  bridge.listen((message) => {
    const handler = devToolMessageHandler[message.type];
    if (!handler) {
      return console.warn('no handler for', message.type, message);
    }
    console.log('hoa.bridge.listen', handler, message);
    handler(message);
  });


  const subscriptions = subscriptionHelper.wrap(props.subscriptions, (subEvents) => {
    if (isBeingDebugged) {
      const id = bridge.emit('subscriptions', subEvents);
      addImportHistory(id, 'subscriptions', subEvents);
    }
  });

  const appSignature = {
    ...props,
    subscriptions,
    middleware,
  };

  const onUnload = () => {
    bridge.close();
  };

  window.addEventListener('unload', onUnload);

  app(appSignature);

  return () => {
    window.removeEventListener('unload', onUnload);
    onUnload();
  };
};
