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

  port.onMessage.addListener((e) => {
    if (e.type !== 'use-hyperapp-devtool') {
      return;
    }

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

