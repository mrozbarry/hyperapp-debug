const OutgoingMessage = (_dispatch, props) => {
  const detail = !props.target || props.target === 'devtool'
    ? { ...props, target: 'app' }
    : props;

  const event = new CustomEvent('hyperapp-debug-relay', { detail });
  window.dispatchEvent(event);
};

export const outgoingMessage = props => [OutgoingMessage, props];
