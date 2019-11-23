import * as subscriptionHelper from './helpers/subscription';
import * as dispatchHelper from './helpers/dispatch';
import devtoolBridge from './bridge/devtool';

const randId = () => Math.random().toString(36).slice(2);

const makeCollector = (onComplete) => {
  let buffer = {};
  let isFirst;

  const reset = () => {
    isFirst = false;
    buffer = {
      action: null,
      effects: [],
      state: null,
    };
  };

  const digOutEffects = (effect) => {
    if (!Array.isArray(effect)) {
      return [];
    }
    if (typeof effect[0] === 'function') {
      return [[{ effect: effect[0], props: effect[1] }]];
    }
    return effect.reduce((effects, effect) => {
      return [
        ...effects,
        ...digOutEffects(effect),
      ];
    }, []);
  };

  const dispatch = (action, props) => {
    if (Array.isArray(action)) {
      if (typeof action[0] === 'function') {
        for (const effect of digOutEffects(action)) {
          buffer.effects.push(effect);
        }
        return;
      } else {
        buffer.state = action[0];
        for (const effect of digOutEffects(action[1])) {
          buffer.effects.push(effect);
        }
        return;
      }
    }
    if (typeof action === 'function') {
      reset();
      buffer.action = { action, props };
      return;
    }
    buffer.state = action;
  };

  const subscriptions = (subscriptionUpdates) => {
    const action = !buffer.action && isFirst
      ? { action: { name: 'Init' }, props: null }
      : buffer.action;
    onComplete({
      ...buffer,
      action,
      subscriptionUpdates,
    });
    reset();
  };

  reset();
  isFirst = true;

  return {
    dispatch,
    subscriptions,
  };
};

export default app => (props) => {
  let dispatch = null;
  const appId = randId();
  const appName = props.debugName || appId;
  const bridge = (props.bridge || devtoolBridge)(appId, appName);
  let dispatchHistory = {};
  let importHistory = [];
  let isBeingDebugged = false;

  const collector = makeCollector((data) => {
    console.log('ready to dump data', data);
  });

  const addImportHistory = (id, type, payload) => {
    if (dispatchHistory[id]) {
      return;
    }
    const item = {
      id,
      appId,
      type,
      payload,
    };
    importHistory.push(item);
  };

  const middleware = originalDispatch => {
    dispatch = originalDispatch;

    return (action, props) => {
      collector.dispatch(action, props);
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
    handler(message);
  });


  const subscriptions = subscriptionHelper.wrap(props.subscriptions, (subEvents) => {
    collector.subscriptions(subEvents);
    const id = bridge.emit('subscriptions', subEvents);
    addImportHistory(id, 'subscriptions', subEvents);
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
