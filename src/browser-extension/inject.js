const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const log = (...args) => (void args); // console.log('[inject]', ...args);

let port = null;
const connect = () => {
  const reconnect = () => {
    port = null;
    setTimeout(connect, 1000); };

  try {
    port = chrome.runtime.connect({ name: 'app' });
  } catch (err) {
    reconnect();
  }

  const postMessage = (message) => {
    log('postMessage', message);
    port.postMessage(message);
  };

  const relayEventsToDevtool = (e) => {
    log('relayEventsToDevtool', e);
    postMessage({
      target: 'devtool',
      ...e.detail,
    });
  };

  const relayEventsToPanel = (e) => {
    log('relayEventsToPanel', e);
    postMessage({
      target: 'panel',
      ...e.detail,
    });
  };

  const relayEventsToApp = (message) => {
    log('relayToApp', message);
    const event = new CustomEvent(DEVTOOL_TO_APP, { detail: JSON.stringify(message) });
    window.dispatchEvent(event);
  };

  window.addEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
  window.addEventListener(APP_TO_PANEL, relayEventsToPanel, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener((event) => {
    port = null;
    log('onDisconnect', event);
    window.removeEventListener(APP_TO_DEVTOOL, relayEventsToDevtool);
    window.removeEventListener(APP_TO_PANEL, relayEventsToPanel);
    reconnect();
  });
};

function hyperappDevTool() {
  return JSON.stringify({
    events: {
      APP_TO_DEVTOOL,
      APP_TO_PANEL,
      DEVTOOL_TO_APP,
    },
  });
}
exportFunction(hyperappDevTool, window, { defineAs: 'hyperappDevTool' });

connect();
