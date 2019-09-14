import * as effects from './effects/index.js';

export const Init = () => [
  {
    events: [],
    groupedEvents: {},
  },
  effects.outgoingMessage({ foo: 'bar' }),
];

export const EventsAdd = (state, message) => {
  return ({
    ...state,
    events: state.events.concat(message).sort((a, b) => a.happenedAt - b.happenedAt),
    groupedEvents: {
      ...state.groupedEvents,
      [message.happenedAt]: [
        ...(state.groupedEvents[message.happenedAt] || []),
        message,
      ]
    },
  });
}
export const EventsClear = (state) => ({ ...state, events: [], groupedEvents: {} });
