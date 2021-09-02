let port = null;

const connect = () => {
  try {
    port = chrome.runtime.connect({ name: 'panel' });
  } catch (err) {
    console.log(err);
    return setTimeout(connect, 100);
  }

  chrome.devtools.panels.create(
    'Hyperapp Dev Tools',
    '/icons/hyperapp.jpg',
    '/panel/index.html',
    (panel) => {
      panel.onShown.addListener(() => {
        port.postMessage({
          target: 'background',
          type: 'restoreHistory',
        });
      });

      panel.onHidden.addListener(() => {
        // Anything?
      });
    },
  );

  port.onMessage.addListener((message) => {
    port.postMessage(message);
  });

  port.onDisconnect.addListener(() => {
    port = null;
    setTimeout(connect, 100);
  });
};

connect();
