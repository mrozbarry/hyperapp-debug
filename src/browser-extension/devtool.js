let port = null;
let devPanel = null;
const connect = () => {
  try {
  port = chrome.runtime.connect({ name: 'panel' });
  console.log('panel devtool', port);
  } catch (err) {
    console.warn(err);
    setTimeout(connect, 100);
  }

  port.onMessage.addListener((e) => {
    console.log('--> panel', e);

    if (!devPanel) {
      chrome.devtools.panels
        .create(
          'Hyperapp Dev Tools',
          '/icons/hyperapp.jpg',
          '/panel/index.html',
          (panel) => {
            devPanel = panel;
            port.postMessage({
              target: 'app',
              type: 'devtools-active',
              payload: {},
            });
          },
        );
    }
  });

  port.onDisconnect.addListener(() => {
    port = null;
    setTimeout(connect, 100);
  });
};

connect();

