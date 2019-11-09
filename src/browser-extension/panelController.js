let port = null;
let registeredApps = [];
let appChangeFn = () => {};

const connect = () => {
  try {
    port = chrome.runtime.connect({ name: 'panel' });
    console.log('connected', port);
  } catch (err) {
    console.log(err);
    return setTimeout(connect, 100);
  }

  const addApp = ({ appId, payload: { appName } }) => {
    const alreadyRegistered = registeredApps.some(a => a.appId === appId);
    if (alreadyRegistered) {
      return;
    }
    registeredApps.push({
      appId,
      appName,
    });
    appChangeFn();
  };

  const removeApp = ({ appId }) => {
    const index = registeredApps.findIndex(a => a.appId === appId);
    if (index >= 0) {
      registeredApps.splice(index, 1);
      appChangeFn();
    }
  };

  chrome.devtools.panels.create(
    'Hyperapp Dev Tools',
    '/icons/hyperapp.jpg',
    '/panel/index.html',
    (panel) => {
      panel.onShown.addListener(() => {
        appChangeFn = () => {
          port.postMessage({
            target: 'devtool',
            type: 'registrations',
            payload: [...registeredApps],
          });
        };
      });

      panel.onHidden.addListener(() => {
        appChangeFn = () => {};
      });
    },
  );

  port.onMessage.addListener((message) => {
    switch (message.type) {
    case 'register':
      addApp(message);
      break;

    case 'unregister':
      removeApp(message);
      break;

    default:
      break;
    }

  });

  port.onDisconnect.addListener(() => {
    port = null;
    setTimeout(connect, 100);
  });
};

connect();

