const RelayMessages = (dispatch) => {
  const port = chrome.runtime.connect({ name: 'RelayMessagesSub' });

  const handleRelay = (event) => {
    console.log('[panel]', 'RelayMessages', event);
    port.postMessage({ target: 'app', payload: event.detail });
  }

  window.addEventListener('hyperapp-debug-relay', handleRelay);

  return () => {
    window.removeEventListener('hyperapp-debug-relay', handleRelay);
    port.disconnect();
  };
};
export const relayMessages = () => [RelayMessages, {}];
