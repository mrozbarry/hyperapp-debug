// const log = (...args) => console.log('[background]', ...args);
const ports = {};
let appIdFilter = null;
let messageHistory = {};

//const getQueuedFor = (name) => {
  //const messages = queuedMessages.filter(m => m.message.target === name);
  //return messages;
//};

//const removeQueued = (item) => {
  //queuedMessages = queuedMessages.filter(m => m !== item);
//};

//const removeQueuedFor = (port) => {
  //queuedMessages = queuedMessages.filter(m => m.port !== port);
//};

// Fake background port to handle messages locally
ports.background = {
  postMessage: (message) => {
    // log('target=background', message);
    if (message.type === 'setFilter') {
      appIdFilter = message.appId;

      const appHistory = (messageHistory.app || []).filter(m => m.appId === appIdFilter);
      appHistory.forEach(m => ports.devtool.postMessage(m));
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
  // log('onConnect', incomingPort, { ports });

  const sendMessage = (message) => {
    if (message.target === 'devtool' && !ports.devtool) {
      return incomingPort.postMessage(message);
    }
    const messagePorts = Object.keys(ports).filter(k => k.split('_')[0] === message.target);
    if (!messagePorts.length) {
      return; // TODO? Anything?
      // return queuedMessages.push({
      //   port: incomingPort,
      //   message,
      // });
    }
    messagePorts.forEach(p => {
      // log('sendMessage', p, ports[p]);
      if (ports[p]) {
        ports[p].postMessage(message)
      }
    });
  };

  incomingPort.onMessage.addListener(async (message) => {
    if (incomingPort.name === 'app' && message.type === 'dispatch') {
      messageHistory[message.appId] = messageHistory[message.appId] || [];
      messageHistory[message.appId].push(message);
    }


    const customHandler = customMessageHandlers[message.target];
    if (!customHandler) {
      return sendMessage(message);
    }

    customHandler(incomingPort, sendMessage, message);
  });

  incomingPort.onDisconnect.addListener(() => {
    // log('onDisconnect', incomingPort.name);
    // removeQueuedFor(incomingPort);
    if (ports[incomingPort.name] === incomingPort) {
      ports[incomingPort.name] = null;
    }
  });
});
