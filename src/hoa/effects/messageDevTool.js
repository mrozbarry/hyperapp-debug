export const raw = (eventName, type, eventIndex, payload) => {
  console.log('messageDevTool.raw', { eventName, type, eventIndex, payload });
  const event = new CustomEvent(eventName, {
    detail: {
      type,
      eventIndex,
      payload: JSON.parse(JSON.stringify(payload))
    },
  });
  window.dispatchEvent(event);
};

const MessageDevTool = (_dispatch, { eventName, type, eventIndex, payload }) => {
  raw(eventName, type, eventIndex, payload);
};

export const messageDevTool = props => [MessageDevTool, props];
