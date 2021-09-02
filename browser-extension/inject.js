const eventName = '$hyperapp-debug';
const eventNameForExtension = `${eventName}:extension`;
let port = null;

const connect = () => {
  const reconnect = () => {
    setTimeout(connect, 1000);
  };

  try {
    port = chrome.runtime.connect({ name: 'app' });
  } catch (err) {
    return reconnect();
  }

  const relayEventsToDevTool = (e) => {
    console.log('relayEventsToDevTool', e.detail);
    port.postMessage({ ... e.detail });
  };

  const relayEventsToApp = (message) => {
    const eventNameForApp = `${eventName}:${message.target}`;
    window.dispatchEvent(new CustomEvent(eventNameForApp, {
      detail: JSON.stringify(message),
    }));
  };

  window.addEventListener(eventNameForExtension, relayEventsToDevTool, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener(() => {
    port = null;
    window.removeEventListener(eventNameForExtension, relayEventsToDevtool);
    reconnect();
  });
};

connect();
console.log('Injected browser extension script');
