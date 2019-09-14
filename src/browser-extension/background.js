let ports = {};
chrome.runtime.onConnect.addListener((port) => {
  ports[port.name] = port;
  console.log('[background]', 'onConnect', port, { ports });

  const sendMessage = (message) => {
    const retry = () => {
      setTimeout(() => {
        sendMessage(message);
      }, 500);
    }
    const port = ports[message.target];
    if (!port) {
      return retry();
    }
    port.postMessage(message);
  }

  port.onMessage.addListener(async (message) => {
    console.log('[background]', 'onMessage', port.name, message);
    sendMessage(message)
  });

  port.onDisconnect.addListener(() => {
    console.log('[background]', 'onDisconnect', port.name);
    ports[port.name] = null;
  });
});
