import { browserTest } from '../support/jsdom';
import { app, h } from 'hyperapp';
import withDebugger from './index';

const makeDevBridge = (onEmit) => {
  const listeners = [];

  const bridge = (appId, appName) => {
    const bridgeInterface = {
      appId,
      appName,
      inject: (message) => {
        listeners.forEach(listener => listener(message));
      },
      emit: (...args) => {
        onEmit(args, { bridgeInterface });
      },
      listen: (callback) => {
        listeners.push(callback);
      },
      close: () => {},
    };
    bridge._interface = bridgeInterface;
    return bridgeInterface;
  };

  return bridge;
};

browserTest('the app emits the registration info when requested from the bridge', (t) => {
  t.plan(1);

  const appName = 'foo';

  let resolve = () => {};
  const promise = new Promise((r) => { resolve = r });

  const devBridge = makeDevBridge((emitArgs, bridge) => {
    if (emitArgs[0] === 'register') {
      t.deepEqual(emitArgs, ['register', { appName }, 'panel']);
      resolve();
    }
  });

  withDebugger(app)({
    // hoa
    debugName: appName,
    bridge: devBridge,

    // hyperapp
    init: {},
  });

  const { _interface } = devBridge;

  _interface.inject({
    type: 'discover',
    target: 'app',
  });

  return promise;
});
