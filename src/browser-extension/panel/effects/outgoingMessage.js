const OutgoingMessage = (_dispatch, props) => {
  const event = new CustomEvent('hyperapp-debug-relay', {
    detail: props,
  });
  window.dispatchEvent(event);
};

export const outgoingMessage = props => [OutgoingMessage, props];
