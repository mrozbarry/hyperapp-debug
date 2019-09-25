const log = () => {}; // (...args) => console.log('[background]', ...args);
const ports = {};
let queuedMessages = [];

const getQueuedFor = (name) => {
  const messages = queuedMessages.filter(m => m.message.target === name);
  return messages;
};

const removeQueued = (item) => {
  queuedMessages = queuedMessages.filter(m => m !== item);
};

const removeQueuedFor = (port) => {
  queuedMessages = queuedMessages.filter(m => m.port !== port);
};

chrome.runtime.onConnect.addListener((incomingPort) => {
  ports[incomingPort.name] = incomingPort;
  log('onConnect', incomingPort, { ports });

  const sendMessage = (message) => {
    const port = ports[message.target];
    if (!port) {
      return queuedMessages.push({
        port,
        message,
      });
    }
    port.postMessage(message);
  };

  const sendPending = () => {
    const pendingMessages = getQueuedFor(incomingPort.name);
    for (const msg of pendingMessages) {
      sendMessage(msg.message);
      removeQueued(msg);
    }
  };

  sendPending();

  incomingPort.onMessage.addListener(async (message) => {
    log('onMessage', incomingPort.name, message);
    sendPending();
    sendMessage(message);
  });

  incomingPort.onDisconnect.addListener(() => {
    log('onDisconnect', incomingPort.name);
    removeQueuedFor(incomingPort);
    if (ports[incomingPort.name] === incomingPort) {
      ports[incomingPort.name] = null;
    }
  });
});
