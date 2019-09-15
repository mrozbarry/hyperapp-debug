const log = (...args) => console.log('[devtool]', ...args);

const HandleMessages = (dispatch, types) => {
  const port = chrome.runtime.connect({ name: 'devtool' });

  const onMessage = (message) => {
    const keys = [
      message.type,
      `${message.type}:${message.payload.action}`,
    ];

    const actionKey = keys.find(k => types[k]);
    let action = types[actionKey];

    const payload = message.type === 'events'
      ? { eventIndex: message.eventIndex, eventBatch: message.payload }
      : message.payload;

    if (action) {
      return dispatch(action, payload);
    }

    log('onMessage', 'unhandled', message);
  };

  port.onMessage.addListener(onMessage);

  const onRelayEvent = (event) => {
    const message = event.detail;
    port.postMessage(message);
  };

  window.addEventListener('hyperapp-debug-relay', onRelayEvent);

  return () => {
    window.removeEventListener('hyperapp-debug-relay', onRelayEvent);
    port.disconnect();
  };
};

export const handleMessages = props => [HandleMessages, props];
