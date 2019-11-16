const eventName = '$hyperapp-debugger';
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

  const relayEventsToDevtool = (e) => {
    port.postMessage({ ... e.detail });
  };

  const relayEventsToApp = (message) => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: JSON.stringify(message),
    }));
  };

  window.addEventListener(eventName, relayEventsToDevtool, false);
  port.onMessage.addListener(relayEventsToApp);

  port.onDisconnect.addListener(() => {
    port = null;
    window.removeEventListener(eventName, relayEventsToDevtool);
    reconnect();
  });
};

connect();
