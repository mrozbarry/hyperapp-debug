import * as logger from './panel/helpers/logger.js';

const log = logger.make('[panel]');

let port = null;
let devPanel = null;
let isShown = false;

const connect = () => {
  try {
    port = chrome.runtime.connect({ name: 'panel' });
    log('connected', port);
  } catch (err) {
    log.warn(err);
    return setTimeout(connect, 100);
  }

  const enableDevtools = () => port.postMessage({ target: 'app', type: 'panel-shown' });
  const disableDevtools = () => port.postMessage({ target: 'app', type: 'panel-hidden' });

  const announce = () => {
    return isShown ? enableDevtools() : disableDevtools();
  };

  const openPanel = () => {
    if (devPanel) {
      return;
    }

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

          devPanel.onShown.addListener(() => {
            isShown = true;
            announce();
          });

          devPanel.onHidden.addListener(() => {
            isShown = false;
            announce();
          });
        });
  };

  openPanel();

  port.onMessage.addListener((message) => {
    switch (message.type) {
    case 'query':
      return announce();
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

