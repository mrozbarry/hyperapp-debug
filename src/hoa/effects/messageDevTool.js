export const raw = (eventName, type, payload) => {
  console.log('messageDevTool.raw', { eventName, type, payload });
  const event = new CustomEvent(eventName, {
    detail: {
      type,
      payload: JSON.parse(JSON.stringify(payload))
    },
  });
  window.dispatchEvent(event);
};

const MessageDevTool = (_dispatch, { eventName, type, payload }) => {
  raw(eventName, type, payload);
};

export const messageDevTool = props => [MessageDevTool, props];
