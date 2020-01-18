import packageJson from '../../../package.json';

const defaultEmitIdGenerator = (appId, type) => {
  return [window.performance.now(), appId, type].join('_');
};

export const makeEmit = (appId, idGenerator) => (type, payload, target = 'devtool') => {
  const id = idGenerator(appId, type);

  const detail = {
    id,
    appId,
    target,
    type,
    payload,
  };
  const event = new window.CustomEvent('$hyperapp-debugger', { detail });
  window.dispatchEvent(event);
  return id;
};

export const makeListen = appId => (fn) => {
  const listener = (event) => {
    const message = typeof event.detail === 'string'
      ? JSON.parse(event.detail) : event.detail;

    if (message.target !== 'app') {
      return;
    }
    if (message.appId && message.appId !== appId) {
      return;
    }
    fn(message);
  };

  window.addEventListener('$hyperapp-debugger', listener);

  return () => {
    window.removeEventListener('$hyperapp-debugger', listener);
  };
};

export default (appId, appName, idGenerator = defaultEmitIdGenerator) => {
  const emit = makeEmit(appId, idGenerator);
  const listen = makeListen(appId);

  emit('register', {
    appName,
    withDebugVersion: packageJson.version,
  }, 'panel');

  const close = () => {
    emit('unregister', {}, 'panel');
  };

  return {
    emit,
    listen,
    close,
  };
};
