import * as effects from './effects/index.js';

export const Init = () => ({
  events: [],
  streams: {
    action: [],
    commit: [],
    effect: [],
    subscription: {},
  },
  inspectedEventIndex: 0,
  eventIndex: 0,
  isPaused: false,
});

export const EventsAdd = (state, { eventIndex, eventBatch }) => {
  console.log('actions.EventsAdd', { eventIndex, eventBatch });
  const nextStreams = eventBatch.reduce((streams, event) => {
    switch (event.type) {
      case 'action':
      case 'commit':
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

      case 'subscription/stop': {
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

  const inspectedEventIndex = eventIndex
    ? eventIndex
    : state.inspectedEventIndex;

  return [
    {
      ...state,

      events: state.events.concat(eventBatch),

      eventIndex,
      inspectedEventIndex,

      streams: nextStreams,

      isPaused: false,
    },
    effects.scrollEventsTo({ eventIndex: inspectedEventIndex }),
  ]
};

export const InspectEventIndex = (state, inspectedEventIndex) => {
  console.log('InspectEventIndex', { state, inspectedEventIndex });
  return [
    {
      ...state,
      inspectedEventIndex,
      isPaused: true,
    },
    [
      effects.scrollEventsTo({ eventIndex: inspectedEventIndex }),
      effects.outgoingMessage({
        type: 'set-state',
        payload: {
          inspectedEventIndex,
          actions: state.streams.action,
          state: (state.streams.commit[inspectedEventIndex] || { state: 'undefined' }).state,
        }
      }),
    ],
  ];
};

export const UnpauseApp = (state) => {
  return [
    {
      ...state,
      inspectedEventIndex: state.eventIndex,
      isPaused: false,
    },
    effects.outgoingMessage({
      type: 'unfreeze',
      payload: {},
    }),
  ];
};
