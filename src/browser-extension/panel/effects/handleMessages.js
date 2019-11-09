const HandleMessages = (dispatch, { events, isPaused }) => {
  let port = null;

  const onMessage = (message) => {
    const keys = [
      message.type,
      `${message.type}:${message.payload.action}`,
    ];

    const actionKey = keys.find(k => events[k]);
    let action = events[actionKey];
    // console.log('HandleMessages.onMessage', actionKey, action);

    if (!isPaused && action) {
      return dispatch(action, message);
    }

    console.warn('onMessage', 'unhandled', { isPaused, events, action, keys }, message);
  };

  const connect = () => {
    port = chrome.runtime.connect({ name: 'devtool' });
    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener((e) => {
      port = null;
      // console.log('HandleMessages.sub', 'port disconnected', e);
      setTimeout(connect, 1);
    });
    // console.log('HandleMessage.sub.init', 'port listening');
  };

  const onRelayEvent = (event) => {
    // console.log('HandleMessages.onRelayEvent', event);
    const message = event.detail;
    port.postMessage(message);
  };

  window.addEventListener('hyperapp-debug-relay', onRelayEvent, false);

  connect();

  return () => {
    window.removeEventListener('hyperapp-debug-relay', onRelayEvent);
    port.disconnect();
  };
};

export const handleMessages = props => [HandleMessages, props];
