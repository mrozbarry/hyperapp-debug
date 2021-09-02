export const ChromeRuntimeConnection = props => [
  function ChromeRuntimeConnectionFx(dispatch, {
    onHistoryAdd,
    onHistoryReset,
  }) {
    if (!window.chrome) {
      console.warn('Not in extension, not running chrome runtime');
      return () => {};
    }

    console.log('ChromeRuntimeConnection.start');
    let port =  null;
    let connect = () => {};

    const onMessage = (message) => {
      console.log('ChromeRuntimeConnection.message', message);
      switch (message.type) {
        case 'restoreHistory':
          return dispatch(onHistoryReset, message.history);

        default:
          return dispatch(onHistoryAdd, message);
      }
    };

    const onDisconnect = () => {
      console.log('ChromeRuntimeConnection.disconnect', message);
      setTimeout(connect, 100);
    };

    connect = () => {
      console.log('ChromeRuntimeConnection.connect');
      port = chrome.runtime.connect({ name: 'devtool' });
      port.onMessage.addListener(onMessage);
      port.onDisconnect.addListener(onDisconnect);
    };

    connect();

    return () => {
      console.log('ChromeRuntimeConnection.cleanup');
      port.disconnect();
    };
  },
  props,
];
