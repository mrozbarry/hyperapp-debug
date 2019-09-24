const log = () => {}; // (...args) => console.log('[background]', ...args);
const ports = {};

chrome.runtime.onConnect.addListener((port) => {
  ports[port.name] = port;
  log('onConnect', port, { ports });

  const sendMessage = (message) => {
    const retry = () => {
      setTimeout(() => {
        sendMessage(message);
      }, 500);
    };
    const port = ports[message.target];
    if (!port) {
      return retry();
    }
    port.postMessage(message);
  };

  port.onMessage.addListener(async (message) => {
    log('onMessage', port.name, message);
    sendMessage(message);
  });

  port.onDisconnect.addListener(() => {
    log('onDisconnect', port.name);
    if (ports[port.name] === port) {
      ports[port.name] = null;
    }
  });
});
