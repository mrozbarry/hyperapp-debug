const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const log = (...args) => console.log('[inject]', ...args);
let port = null;
let connectedAndOpen = false;

const connect = () => {
  const reconnect = () => {
    port = null;
    setTimeout(connect, 1000);
  };

  try {
    port = chrome.runtime.connect({ name: 'app' });
  } catch (err) {
    return reconnect();
  }

  const postMessage = (message) => {
    console.log('inject.postMessage', { connectedAndOpen, target: message.target });
    if (!connectedAndOpen && message.target === 'devtool') {
      return relayEventsToApp(message);
    }
    port.postMessage(message);
  };

  const relayEventsToDevtool = (e) => {
    console.log('relayEventsToDevtool', e.detail);
    postMessage({
      target: 'devtool',
      ...e.detail,
    });
  };

  const relayEventsToPanel = (e) => {
    console.log('relayEventsToPanel', e);
    postMessage({
      target: 'panel',
      ...e.detail,
    });
  };

  const relayEventsToApp = (message) => {
    console.log('relayToApp', message);
    switch (message.type) {
    case 'panel-shown':
      connectedAndOpen = true;
      break;

    case 'panel-hidden':
      connectedAndOpen = false;
      break;

    default:
      break;
    }

    window.dispatchEvent(new CustomEvent(DEVTOOL_TO_APP, {
      detail: JSON.stringify(message),
    }));
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

connect();
