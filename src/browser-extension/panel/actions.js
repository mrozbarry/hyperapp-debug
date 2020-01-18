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
  { appId: null, appName: '<Not Debugging>', isCompatible: true },
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

const decode = (data, id) => {
  if (!data) return [];
  const type = streamHelpers.typeOfAction(data);
  switch (type) {
  case 'action': return [
    { type, label: data.action.name, props: data.props, timeSlices: 1 },
  ];
  case 'commit+effect': return [
    { type: 'commit', label: 'COMMIT', timeSlices: 1, state: data.action[0], payload: data, id },
    { type: 'effect', label: data.action[1][0].name, props: data.action[1][1], id },
  ];
  case 'commit': return [
    { type, label: 'COMMIT', timeSlices: 1, state: data.action, payload: data, id },
  ];
  default: return [];
  }
};

export const SetRegistrations = (state, message) => {
  const apps = setAppsState(message.payload);
  const isCurrentAppRegistered = state.debugApp && apps.some(a => a.appId === state.debugApp);
  const getDebugAppFromMessage = () => {
    return message.payload.length > 0
      ? message.payload[0].appId
      : null;
  };
  const debugApp = isCurrentAppRegistered
    ? state.debugApp
    : getDebugAppFromMessage();

  const baseState = debugApp === state.debugApp
    ? state 
    : Init();

  const stateUpdate = {
    ...baseState,
    apps: setAppsState(message.payload),
    debugApp,
  };

  return debugApp === state.debugApp
    ? stateUpdate
    : DebugApp(stateUpdate, { target: { value: debugApp } });
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
      queue: state.queue.concat(decode(payload, id)),
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

const findActiveSubscriptions = (subscriptionStreamLookup) => {
  // { name: 'FooFX', index: 1 }
  return Object.keys(subscriptionStreamLookup).reduce((actives, subscriptionName) => {
    return [
      ...actives,
      ...subscriptionStreamLookup[subscriptionName]
        .map((sub, index) => ({ name: subscriptionName, index, data: sub }))
        .filter(active => !active.data.ended),
    ];
  }, []);
};

const isSameSub = (sub1, sub2) => {
  const isProbablySameEffect = sub1[0].name === sub2[0].name;
  if (!isProbablySameEffect) return false;

  const propNames = Array.from(new Set(Object.keys(sub1[1]).concat(Object.keys(sub2[1]))));

  for(const propName of propNames) {
    if (sub1[1][propName] != sub2[1][propName]) return false;
  }

  return true;
};

const resolveSubscriptionStreamFromPayload = (eventIndex, payload, subscriptionStreamLookup) => {
  const remainingPayload = [...payload];

  // Match up previously un-ended subscriptions with new data
  const nextSubscriptionStreamLookup = { ...subscriptionStreamLookup };
  for(const activeSubscription of findActiveSubscriptions(subscriptionStreamLookup)) {
    const { data } = activeSubscription;


    let update = {};
    const index = remainingPayload.findIndex(sub => isSameSub(sub, [{ name: activeSubscription.name }]));
    if (index === -1) {
      update = { ended: true };
    } else {
      remainingPayload.splice(index, 1);
      update = { ended: false, timeSlices: data.timeSlices + 1 };
    }

    nextSubscriptionStreamLookup[activeSubscription.name] = injectIntoArray(
      nextSubscriptionStreamLookup[activeSubscription.name],
      activeSubscription.index,
      {
        ...data,
        ...update,
      },
    );
  }

  // Create new subscription stream entries for payload data that was not previously used in above loop
  for(const subscription of remainingPayload) {
    const { name } = subscription[0];
    nextSubscriptionStreamLookup[name] = injectIntoArray(
      nextSubscriptionStreamLookup[name],
      eventIndex,
      {
        type: 'subscription',
        label: name,
        timeSlices: 1,
        ended: false,
      },
    );
  }

  return nextSubscriptionStreamLookup;
};

export const CommitDispatch = (state, { appId, payload }) => {
  if (appId !== state.debugApp) {
    return state;
  }
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
    subscription: resolveSubscriptionStreamFromPayload(eventIndex, payload, state.streams.subscription),
  };

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
        appId: state.debugApp,
        id: commit.id,
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
