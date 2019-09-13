const HandleMessages = (dispatch, types) => {
  const onMessage = (message) => {
    console.log('[panel]', 'HandleMessages.onMessage', message);
    const action = types[message.type];
    if (!action) {
      return console.log(`Unable to handle ${message.type} messages`, message);
    }
    dispatch(action, message.payload);
  };

  chrome.runtime.onMessage.addListener(onMessage);

  return () => {
    chrome.runtime.onMessage.removeListener(onMessage);
  };
};

export const handleMessages = props => [HandleMessages, props];
