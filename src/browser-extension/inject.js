const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const connect = () => {
  let port = chrome.runtime.connect({ name: 'app' });
  console.log('[inject]', 'connected', port);

  const relayEventsToDevtool = (e) => {
    console.log('[inject]', 'relayEventsToDevtool', e.detail);
    port.postMessage(e.detail);
  }

  const relayEventsToApp = (message) => {
    console.log('[inject]', 'relayEventsToApp', message);
    const event = new CustomEvent(DEVTOOL_TO_APP, { detail: message });
    window.dispatchEvent(event);
  }

  const reconnect = () => {
    port = null;
    setTimeout(connect, 1000);
  };

  window.addEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener((event) => {
    console.log('[inject]', 'onDisconnect', event);
    window.removeEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
    reconnect();
  });
};

connect();
