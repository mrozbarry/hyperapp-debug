import * as effects from './effects/index.js';

export const Init = () => ({
  events: [],
  groupedEvents: {},
  streams: {
    action: [],
    effect: [],
    subscription: {},
  },
  eventIndex: 0,
});

export const EventsAdd = (state, eventCollection) => {
  const { eventIndex } = state;

  const nextStreams = eventCollection.reduce((streams, event) => {
    switch (event.type) {
      case 'action':
      case 'effect': {
        const stream = [...streams[event.type]];
        stream[eventIndex] = {
          ...event,
          duration: 1,
        };

        return {
          ...streams,
          [event.type]: stream,
        };
      }

      case 'subscription/start': {
        const stream = [...(streams.subscription[event.name] || [])];
        stream[eventIndex] = {
          ...event,
          duration: 1,
        };

        return {
          ...streams,
          subscription: {
            ...streams.subscription,
            [event.name]: stream,
          }
        };
      }

      case 'subscription/end': {
        const stream = [...(streams.subscription[event.name] || [])];
        stream[eventIndex] = {
          ...event,
          duration: 1,
        };

        return {
          ...streams,
          subscription: {
            ...streams.subscription,
            [event.name]: stream,
          }
        };
      }

      default:
        console.log('OH NO!', 'EventsAdd', event.type);
        return streams;
    }
  }, { ...state.streams });

  return {
    ...state,

    events: state.events.concat(eventCollection),

    streams: nextStreams,

    eventIndex: eventIndex + 1,
  }
};

export const EventsClear = Init;
