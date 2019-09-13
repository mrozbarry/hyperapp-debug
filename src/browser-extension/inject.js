

const connect = () => {
  let port = chrome.runtime.connect({ name: 'hyperapp-debug-inject' });
  console.log('inject', port);

  const relayEvents = (e) => chrome.runtime.sendMessage(e.detail);

  const reconnect = () => {
    port = null;
    setTimeout(connect, 1000);
  };

  window.addEventListener('HyperappV2DevToolMessage', relayEvents, false);

  port.onDisconnect.addListener(() => {
    window.removeEventListener('HyperappV2DevToolMessage', relayEvents, false);
    reconnect();
  });
};

connect();
