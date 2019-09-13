import * as effects from './effects/index.js';

export const Init = () => [
  {
    events: [],
  },
  effects.outgoingMessage({ foo: 'bar' }),
];

export const EventsAdd = (state, message) => ({ ...state, events: state.events.concat(message) });
export const EventsClear = (state) => ({ ...state, events: [] });
