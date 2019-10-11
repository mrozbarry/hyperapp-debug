import * as effects from './effects/index.js';
import * as streamHelpers from './helpers/stream.js';
import currentEventIndex from './helpers/currentEventIndex.js';

const injectIntoArray = (arr, index, data) => {
  if (!arr) {
    const tmp = new Array(index);
    tmp[index] = data;
    return tmp;
  }
  arr[index] = data;
  return arr;
};

export const Init = () => {
  return {
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
    appState: {
      openedPaths: [],
    },
    appAction: {
      openedPaths: [],
    },
    appEffect: {
      openedPaths: [],
    },
  };
};

const decode = (data) => {
  if (!data) return [];
  const type = streamHelpers.typeOfAction(data);
  switch (type) {
  case 'action': return [
    { type, label: data.action.name, props: data.props, timeSlices: 1 },
  ];
  case 'commit+effect': return [
    { type: 'commit', label: 'COMMIT', timeSlices: 1, state: data.action[0], payload: data, id: data.id },
    { type: 'effect', label: data.action[1][0].name, props: data.action[1][1], id: data.id },
  ];
  case 'commit': return [
    { type, label: 'COMMIT', timeSlices: 1, state: data.action, payload: data, id: data.id },
  ];
  default: return [];
  }
};

const mergeSubs = (subscription, eventIndex, data) => {
  if (data.type === 'subscription/start') {
    return {
      ...subscription,
      [data.name]: injectIntoArray(subscription[data.name], eventIndex, {
        type: 'subscription',
        label: data.name,
        timeSlices: 1,
        ended: false,
      }),
    };

  } else {
    const source = [...(subscription[data.name] || [])];
    const index = source.reverse().findIndex(s => s && !s.ended);
    if (index >= 0) {
      const lastIndex = source.length - index - 1;
      const sub = subscription[data.name][lastIndex];
      return {
        ...subscription,
        [data.name]: injectIntoArray(subscription[data.name], lastIndex, {
          ...sub,
          ended: true,
          timeSlices: eventIndex - lastIndex + 1,
        }),
      };
    }
  }

  return subscription;
};

export const ProcessDispatch = (state, message) => {
  const { payload, appId, id, type, wasQueued } = message;
  return [
    {
      ...state,
      queue: state.queue.concat(decode(payload)),
    },
    effects.outgoingMessage({
      appId,
      id,
      type,
      payload,
      wasQueued,
    }),
  ];
};

export const CommitDispatch = (state, { payload }) => {
  console.log('CommitDispatch', 'queue', state.queue);
  const items = state.queue.reduce((nextItems, event) => {
    return {
      ...nextItems,
      [event.type]: event,
    };
  }, {});
  const eventIndex = currentEventIndex(state) + 1;

  const streams = {
    ...state.streams,
    action: injectIntoArray(state.streams.action, eventIndex, items.action),
    commit: injectIntoArray(state.streams.commit, eventIndex, items.commit),
    effect: injectIntoArray(state.streams.effect, eventIndex, items.effect),
    subscription: payload.reduce((subscription, event) => (
      mergeSubs(subscription, eventIndex, event)
    ), state.streams.subscription),
  };

  console.log('CommitDispatch', streams);

  return [
    {
      ...state,
      queue: [],
      streams,
    },
    effects.scrollEventsTo({ eventIndex }),
  ];
};

export const InspectEventIndex = (state, inspectedEventIndex) => {
  // console.log('InspectEventIndex', { state, inspectedEventIndex });
  const commit = state.streams.commit[inspectedEventIndex];
  if (!commit) {
    return state;
  }

  return [
    {
      ...state,
      inspectedEventIndex,
      isPaused: true,
    },
    [
      effects.scrollEventsTo({ eventIndex: inspectedEventIndex }),
      effects.outgoingMessage({
        type: 'dispatch',
        payload: commit.payload,
      }),
    ],
  ];
};

export const PauseApp = (state, { isPaused }) => {
  const eventIndex = currentEventIndex(state);

  return [
    {
      ...state,
      inspectedEventIndex: isPaused? (state.inspectedEventIndex || eventIndex) : null,
      isPaused,
    },
  ];
};
