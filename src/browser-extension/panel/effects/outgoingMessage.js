const OutgoingMessage = (_dispatch, props) => {
  const detail = { ...props, target: 'app' };
  const event = new CustomEvent('hyperapp-debug-relay', { detail });
  window.dispatchEvent(event);
};

export const outgoingMessage = props => [OutgoingMessage, props];
