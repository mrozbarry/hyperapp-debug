const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const log = (...args) => console.log('[inject]', ...args);

const connect = () => {
  let port = chrome.runtime.connect({ name: 'app' });

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
  }

  const relayEventsToPanel = (e) => {
    log('relayEventsToPanel', e);
    postMessage({
      target: 'panel',
      ...e.detail,
    });
  }

  const relayEventsToApp = (message) => {
    const event = new CustomEvent(DEVTOOL_TO_APP, { detail: message });
    window.dispatchEvent(event);
  }

  const reconnect = () => {
    port = null;
    setTimeout(connect, 1000);
  };

  window.addEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
  window.addEventListener(APP_TO_PANEL, relayEventsToPanel, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener((event) => {
    console.log('[inject]', 'onDisconnect', event);
    window.removeEventListener(APP_TO_DEVTOOL, relayEventsToDevtool);
    window.removeEventListener(APP_TO_PANEL, relayEventsToPanel);
    reconnect();
  });
};

connect();
