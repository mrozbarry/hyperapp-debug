import * as logger from './panel/helpers/logger.js';

const log = logger.make('[panel]');

let port = null;
let devPanel = null;

const connect = () => {
  try {
    port = chrome.runtime.connect({ name: 'panel' });
    log('connected', port);
  } catch (err) {
    log.warn(err);
    setTimeout(connect, 100);
  }

  const enableDevtools = () => port.postMessage({ target: 'app', type: 'panel-shown' });
  const disableDevtools = () => port.postMessage({ target: 'app', type: 'panel-hidden' });

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
            enableDevtools();
          });

          devPanel.onHidden.addListener(() => {
            disableDevtools();
          });
        });
  };

  openPanel();

  // port.onMessage.addListener((e) => {
  //   if (e.type === 'use-hyperapp-devtool') {
  //     enabled = true;
  //   }
  //
  //   openPanel();
  //
  // });

  port.onDisconnect.addListener(() => {
    port = null;
    setTimeout(connect, 100);
  });
};

connect();

