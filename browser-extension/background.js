const appEventHistory = [];
const ports = {};
const intercepts = {
  panel: (message) => {
    appEventHistory.unshift(message);
  },
};

ports.background = {
  name: 'background',
  postMessage: (message) => {
    switch (message.type) {
      case 'restoreHistory':
        return ports.panel
          ? ports.devtool.postMessage({
            target: 'devtool',
            source: 'background',
            type: 'restoreHistory',
            history: appEventHistory,
          })
          : setTimeout(() => ports.background.postMessage(message), 100);

      default:
        console.log('Unsupported background message', message);
        break;
    }
  },
};

let pendingMessages = [];

const queueMessage = (message) => {
  pendingMessages.push(message);
};

const dequeueMessages = (port) => {
  const pendingPortMessages = pendingMessages.filter(pm => pm.message.target === port.name);
  pendingMessages = pendingMessages.filter(pm => pm.message.target !== port.name);
  for(const m of pendingPortMessages) {
    sendMessage(m.message, m.attempts);
  }
};

chrome.runtime.onConnect.addListener((incomingPort) => {
  console.log('background.onConnect.addListener', incomingPort.name);
  ports[incomingPort.name] = incomingPort;
  dequeueMessages(incomingPort);

  const forwardMessage = (message, attempts = 3) => {
    const intercept = intercepts[message.target];
    if (intercept) {
      intercept(message);
    }
    const port = ports[message.target];
    if (port) {
      console.log('sendMessage', message);
      port.postMessage(message);
    } else if (attempts > 0) {
      queueMessage({ message, attempts: attempts - 1 });
    }
  };

  incomingPort.onMessage.addListener(async (message) => {
    console.log('background.port', incomingPort.name, message);
    return forwardMessage(message);
  });

  incomingPort.onDisconnect.addListener(() => {
    if (ports[incomingPort.name] === incomingPort) {
      ports[incomingPort.name] = null;
    }
  });
});
