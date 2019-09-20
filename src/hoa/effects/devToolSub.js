const DevToolSub = (dispatch, props) => {
  const onDevtoolMessage = (event) => {
    const message = event.detail;
    if (message.type === 'set-state') {
      dispatch(message.payload.state);
    } else {
      console.log('[FROM DEV TOOL]', message);
    }
  };

  window.addEventListener(props.eventName, onDevtoolMessage);

  return () => {
    window.removeEventListener(props.eventName, onDevtoolMessage);
  };
};

export const devToolSub = (props = {}) => [DevToolSub, props];
