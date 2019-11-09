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

const setAppsState = (apps) => [
  { appId: null, appName: '<Not Debugging>' },
  ...apps,
];

export const Init = () => {
  return {
    apps: setAppsState([]),
    debugApp: null,
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

export const SetRegistrations = (state, message) => {
  const apps = setAppsState(message.payload);
  const debugApp = apps.some(a => a.appId === state.debugApp)
    ? state.debugApp
    : null;

  return {
    ...state,
    apps: setAppsState(message.payload),
    debugApp,
  };
};

export const DebugApp = (state, event) => {
  const debugApp = event.target.value;

  const baseState = !debugApp ? Init() : state;

  return [
    {
      ...baseState,
      apps: state.apps,
      debugApp,
    },
    effects.outgoingMessage({
      appId: debugApp,
      type: 'use',
      payload: {},
    }),
  ];
};

export const ImportDispatches = (state, message) => {
  return message.payload.reduce((nextState, { id, type, payload }) => {
    return type === 'dispatch'
      ? ProcessDispatch(nextState, { id, appId: state.debugApp, type, payload })[0]
      : CommitDispatch(nextState, { id, appId: state.debugApp, type, payload })[0];
  }, {
    ...Init(),
    apps: state.apps,
    debugApp: state.debugApp,
  });
};

export const ProcessDispatch = (state, message) => {
  const { payload, appId, id, type, wasQueued } = message;
  if (appId !== state.debugApp) {
    return state;
  }
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

export const CommitDispatch = (state, { appId, payload }) => {
  if (appId !== state.debugApp) {
    return state;
  }
  // console.log('CommitDispatch', 'queue', state.queue);
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

  // console.log('CommitDispatch', streams);

  return [
    {
      ...state,
      queue: [],
      streams,
    },
    effects.scrollEventsTo({ eventIndex, animate: false }),
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
      effects.scrollEventsTo({ eventIndex: inspectedEventIndex, animate: true }),
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
