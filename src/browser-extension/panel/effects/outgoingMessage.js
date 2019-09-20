const OutgoingMessage = (_dispatch, props) => {
  const event = new CustomEvent('hyperapp-debug-relay', {
    detail: {
      ...props,
      target: 'app',
    },
  });
  window.dispatchEvent(event);
};

export const outgoingMessage = props => [OutgoingMessage, props];
