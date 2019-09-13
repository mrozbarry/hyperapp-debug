const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const connect = () => {
  let port = chrome.runtime.connect({ name: 'hyperapp-debug-inject' });
  console.log('inject', port);

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
    console.log('lost connection, attempting reconnect in 1s');
    port = null;
    setTimeout(connect, 1000);
  };

  window.addEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener(() => {
    window.removeEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
    reconnect();
  });
};

connect();
