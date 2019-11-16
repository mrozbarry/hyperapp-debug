const ports = {};

let pendingPanelMessages = [];

const queueMessage = (message) => {
  if (message.target !== 'panel') {
    return;
  }
  pendingPanelMessages.push(message);
};

const dequeueMessages = (port) => {
  if (port.name !== 'panel') {
    return;
  }
  if (pendingPanelMessages.length === 0) {
    return;
  }
  for(const m of pendingPanelMessages) {
    port.postMessage(m);
  }
  pendingPanelMessages = [];
};


chrome.runtime.onConnect.addListener((incomingPort) => {
  ports[incomingPort.name] = incomingPort;
  dequeueMessages(incomingPort);

  const sendMessage = (message) => {
    const port = ports[message.target];
    if (port) {
      port.postMessage(message);
    } else {
      queueMessage(message);
    }
  };

  incomingPort.onMessage.addListener(async (message) => {
    return sendMessage(message);
  });

  incomingPort.onDisconnect.addListener(() => {
    if (ports[incomingPort.name] === incomingPort) {
      ports[incomingPort.name] = null;
    }
  });
});
