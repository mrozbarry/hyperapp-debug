const ports = {};
let messageHistory = {};

// Message handlers
const customMessageHandlers = {
  devtool: (port, sendMessage, message) => {
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
        ports[p].postMessage(message);
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
    if (ports[incomingPort.name] === incomingPort) {
      ports[incomingPort.name] = null;
    }
  });
});
