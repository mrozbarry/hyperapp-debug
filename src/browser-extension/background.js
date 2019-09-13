chrome.runtime.onConnect.addListener((port) => {
  console.log('[background]', 'onConnect', port);

  const sendMessage = (port, message, attempts = 5) => {
    if (attempts === 0) {
      throw new Error('Unable to send message after 5 tries');
    }
    switch (message.target) {
      case 'app':
        try {
          return port.postMessage(message);
        } catch (err) {
          console.warn('unable to send message, trying again');
          setTimeout(() => {
            sendMessage(port, message, attempts - 1);
          }, 500);
        }

      case 'devtool':
        return chrome.runtime.sendMessage(message, (response) => {
          console.log('[background]', 'sendMessage.response', response);
        });
    }
  }

  port.onMessage.addListener(async (message) => {
    console.log('[background]', 'onMessage', port.name, message);
    sendMessage(port, message)
  });
});
