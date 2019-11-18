export const makeEmit = appId => (type, payload, target = 'devtool') => {
  const id = [
    performance.now(),
    appId,
    type,
  ].join('_');

  const detail = {
    id,
    appId,
    target,
    type,
    payload,
  };
  const event = new CustomEvent('$hyperapp-debugger', { detail });
  window.dispatchEvent(event);
  return id;
};

export const makeListen = appId => (fn) => {
  const listener = (event) => {
    const message = typeof event.detail === 'string'
      ? JSON.parse(event.detail)
      : event.detail;

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

export default (appId, appName) => {
  const emit = makeEmit(appId);
  const listen = makeListen(appId);

  emit('register', { appName }, 'panel');

  const close = () => {
    emit('unregister', {}, 'panel');
  };

  return {
    emit,
    listen,
    close,
  };
};
