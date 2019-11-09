const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';
const REGISTER_TO_APP = '$hyperapp-register-to-app';
const REGISTER_TO_CONTENTSCRIPT = '$hyperapp-register-to-contentscript';

// const log = (...args) => console.log('[inject]', ...args);
let port = null;
//let connectedAndOpen = false;

document.body.setAttribute('data-hyperapp-debug', 'yes');
console.log('inject', document.body.getAttribute('data-hyperapp-debug'));

const connect = () => {
  const reconnect = () => {
    setTimeout(connect, 1000);
  };

  try {
    port = chrome.runtime.connect({ name: 'app' });
  } catch (err) {
    return reconnect();
  }

  const postMessage = (message) => {
    // log('inject.postMessage', { connectedAndOpen, target: message.target });
    //if (!connectedAndOpen && message.target === 'devtool') {
      //return relayEventsToApp(message);
    //}
    port.postMessage(message);
  };

  const relayEventsToDevtool = (e) => {
    // log('relayEventsToDevtool', e.detail);
    postMessage({
      target: 'devtool',
      ...e.detail,
    });
  };

  const relayEventsToPanel = (e) => {
    // log('relayEventsToPanel', e);
    postMessage({
      target: 'panel',
      ...e.detail,
    });
  };

  const relayEventsToApp = (message) => {
    // log('relayToApp', message);
    //switch (message.type) {
    //case 'panel-shown':
      //connectedAndOpen = true;
      //break;

    //case 'panel-hidden':
      //connectedAndOpen = false;
      //break;

    //default:
      //break;
    //}

    window.dispatchEvent(new CustomEvent(DEVTOOL_TO_APP, {
      detail: JSON.stringify(message),
    }));
  };

  const sendRegistrationConfirmation = () => {
    // log('Got meta request');
    relayEventsToApp({
      type: 'meta',
      version: 0,
    });
  };

  window.addEventListener(APP_TO_DEVTOOL, relayEventsToDevtool, false);
  window.addEventListener(APP_TO_PANEL, relayEventsToPanel, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener(() => {
    port = null;
    // log('onDisconnect', event);
    window.removeEventListener(APP_TO_DEVTOOL, relayEventsToDevtool);
    window.removeEventListener(APP_TO_PANEL, relayEventsToPanel);
    reconnect();
  });
};

connect();
