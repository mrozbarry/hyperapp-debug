import * as effects from './effects.js';

export const INITIAL_STATE = {
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
      subscriptions: true,
    },
  },
  history: [],
  stateForDisplay: '',
};

export const setStateForDisplay = (state, stateForDisplay) => ({
  ...state,
  stateForDisplay,
});

export const AddHistoryItem = (state, historyItem) => {
  return {
    ...state,
    history: [historyItem, ...state.history],
  };
};

export const ResetHistory = (state, history) => {
  return {
    ...state,
    history,
  };
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
    },
  },
  historyId && effects.highlight({
    state: state.history.find(h => h.id === historyId).state,
    language: 'json',
    onRender: setStateForDisplay,
  }),
];

