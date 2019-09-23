import * as effects from './effects/index.js';
import * as streamHelpers from './helpers/stream.js';
// TODO: replace eventIndex state with computed helper, currentEventIndex
import currentEventIndex from './helpers/currentEventIndex.js';

export const Init = () => ({
  queue: [],
  streams: {
    action: [],
    commit: [],
    effect: [],
    subscription: {},
  },
  inspectedEventIndex: null,
  eventIndex: 0,
  isPaused: false,
});

const decode = (data) => {
  console.log('decode', { data });
  if (!event) return [];
  const type = streamHelpers.typeOfAction(data);
  switch (type) {
  case 'action': return [{ label: data.action.name, timeSlices: 1 }];
  case 'effect': return [{ label: data.action[0].name, timeSlices: 1 }];
  case 'subscription/start': return [{ data: event.action[0].name, timeSlices: 1 }];
  default: return [];
  }
};

export const ProcessDispatch = (state, props) => {
  return [
    {
      ...state,
      queue: state.queue.concat(decode(props)),
    },
    effects.outgoingMessage({
      type: 'dispatch',
      payload: props,
    }),
  ];
};

const injectIntoArray = (arr, index, data) => {
  arr[index] = data;
  return arr;
};

export const CommitDispatch = (state, props) => {
  const items = streamHelpers.splitQueue(state.queue);
  const eventIndex = currentEventIndex(state) + 1;
  console.log('CommitDispatch', { state, items, props });

  return {
    ...state,
    queue: [],
    streams: {
      ...state.streams,
      action: injectIntoArray(state.streams.action, eventIndex, items.action),
      commit: injectIntoArray(state.streams.commit, eventIndex, items.commit),
      effect: injectIntoArray(state.streams.effect, eventIndex, items.effect),
    },
  };
};

export const EventsAdd = (state, { eventIndex, eventBatch }) => {
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
  ];
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
