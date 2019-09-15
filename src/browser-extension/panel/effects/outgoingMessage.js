// outgoing effect ->
// handle messages sub ->
// background relay ->
// content script ->
// event to window context ->
// hoa listener
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
