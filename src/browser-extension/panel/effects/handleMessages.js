const log = (...args) => console.log('[devtool]', ...args);

const HandleMessages = (dispatch, types) => {
  const port = chrome.runtime.connect({ name: 'devtool' });

  const onMessage = (message) => {
    const action = types[message.type];
    // console.log('[devtool]'
    if (action) {
      return dispatch(action, message.payload);
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
