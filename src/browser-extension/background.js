const log = (...args) => console.log('[background]', ...args);
const ports = {};
let queuedMessages = [];
let appIdFilter = null;

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

// Fake background port to handle messages locally
ports.background = {
  postMessage: (message) => {
    log('target=background', message);
    if (message.type === 'setFilter') {
      appIdFilter = message.appId;
    }
  },
};

// Message handlers
const customMessageHandlers = {
  devtool: (port, sendMessage, message) => {
    const matchesFilter = appIdFilter && message.appId === appIdFilter;

    if (message.type === 'dispatch' && !matchesFilter) {
      return sendMessage({ ...message, target: port.name });
    }
    sendMessage(message);
  },
};

chrome.runtime.onConnect.addListener((incomingPort) => {
  ports[incomingPort.name] = incomingPort;
  log('onConnect', incomingPort, { ports });

  const sendMessage = (message) => {
    const messagePorts = Object.keys(ports).filter(k => k.split('_')[0] === message.target);
    if (!messagePorts.length) {
      return queuedMessages.push({
        port: incomingPort,
        message,
      });
    }
    messagePorts.forEach(p => {
      log('sendMessage', p, ports[p]);
      if (ports[p]) {
        ports[p].postMessage(message)
      }
    });
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

    const customHandler = customMessageHandlers[message.target];
    if (!customHandler) {
      return sendMessage(message);
    }

    customHandler(incomingPort, sendMessage, message);
  });

  incomingPort.onDisconnect.addListener(() => {
    log('onDisconnect', incomingPort.name);
    removeQueuedFor(incomingPort);
    if (ports[incomingPort.name] === incomingPort) {
      ports[incomingPort.name] = null;
    }
  });
});
