import * as effects from './effects.js';

const historyEvent = (type, name, props = {}, extra = {}) => ({
  ...extra,
  id: Math.random().toString(36),
  type,
  name,
  props,
  timestamp: 0,
});

export const INITIAL_STATE = {
  currentState: {},
  currentSubscriptions: [],
  filters: {
    toggle: {
      actions: true,
      effects: true,
      subscriptions: true,
    },
    search: '',
  },
  browsing: {
    historyId: null,
    expand: {
      state: true,
      subscriptions: false,
    },
  },
  history: [],
  stateForDisplay: '',
};

export const setStateForDisplay = (state, stateForDisplay) => ({
  ...state,
  stateForDisplay,
});

export const AddAction = (state, props) => ({
  ...state,
  history: [
    historyEvent(
      'action',
      props.name,
      props.props,
      { state: { ...props.state }, subscriptions: [...state.currentSubscriptions] }
    )
  ].concat(state.history),
  currentState: props.state,
});

export const AddEffect = (state, props) => ({
  ...state,
  history: [
    historyEvent(
      'effect',
      props.name,
      props.props,
      { state: { ...props.currentState }, subscriptions: [...state.currentSubscriptions] }
    )
  ].concat(state.history),
  currentState: props.state,
});

const subscriptionsDiff = (oldSubs, newSubs) => {
  const serialize = s => [s.name, JSON.stringify(s.props)].join('_');
  
  const newSubsSerialized = newSubs.map(serialize);
  const stopped = oldSubs
    .filter(oldSub => {
      const oldSubSerialized = serialize(oldSub);
      return !newSubsSerialized.find(nss => oldSubSerialized !== nss)
    });
  
  const oldSubsSerialized = oldSubs.map(serialize);
  const started = newSubs
    .filter(newSub => {
      const newSubSerialized = serialize(newSub);
      return !oldSubsSerialized.find(oss => newSubSerialized !== oss)
    });
  
  return {
    stopped,
    started,
  };
};

export const AddSubscriptions = (state, props) => {
  const currentSubscriptions = props.subscriptions;
  const diff = subscriptionsDiff(state.currentSubscriptions, currentSubscriptions);

  const currentState = { ...state.currentState };
  
  return {
    ...state,
    history: [
      ...diff.stopped.map(s => historyEvent(
        'subscription stopped',
        s.name,
        s.props,
        s.timestamp,
        { state: currentState, subscriptions: currentSubscriptions },
      )),
      ...diff.started.map(s => historyEvent(
        'subscription started',
        s.name,
        s.props,
        s.timestamp,
        { state: currentState, subscriptions: currentSubscriptions },
      ))
    ].concat(state.history),
    currentSubscriptions,
  }
};

export const SetFilterToggle = (state, { filter, value }) => ({
  ...state,
  filters: {
    ...state.filters,
    toggle: {
      ...state.filters.toggle,
      [filter]: value,
    }
  },
});

export const SetFilterSearch = (state, search) => ({
  ...state,
  filters: {
    ...state.filters,
    search,
  },
});

export const SelectBrowsingHistoryId = (state, historyId) => [
  {
    ...state,
    browsing: {
      ...state.browsing,
      historyId,
    }
  },
  historyId && effects.highlight({
    state: state.history.find(h => h.id === historyId).state,
    language: 'json',
    onRender: setStateForDisplay,
  }),
];

