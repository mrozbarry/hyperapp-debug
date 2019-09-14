const HandleMessages = (dispatch, types) => {
  const port = chrome.runtime.connect({ name: 'devtool' });

  const onMessage = (message) => {
    console.log('[devtool]', 'onMessage', message);
    const action = types[message.type];
    if (action) {
      return dispatch(action, message.payload);
    }
    if (message.type === 'message') {
      const attr = `message:${message.payload.action}`;
      const messageHandler = types[attr];
      console.log('got a message', { attr, messageHandler, message });
      if (messageHandler) {
        return dispatch(messageHandler, message.payload);
      }
    }
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
