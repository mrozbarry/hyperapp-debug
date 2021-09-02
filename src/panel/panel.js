import { app, h, text } from 'hyperapp';

import { HyperappEvent } from './components/HyperappEvent.js';
import { Container } from './components/Container.js';
import { Header } from './components/Header.js';
import { H1 } from './components/Text.js';

import { ChromeRuntimeConnection } from './subscriptions/ChromeRuntimeConnection.js';

import * as actions from './actions.js';


const rootClasses = (state) => {
  return state.browsing.historyId
    ? ['grid grid-cols-1 grid-rows-2 h-screen gap-2', 'md:grid-cols-2 md:grid-rows-1']
    : [];
};

const selectHistory = (state) => {
  const search = state.filters.search.toLowerCase();

  return state.history
    .filter(hist => {
      const showType = (hist.type === 'action' && state.filters.toggle.actions)
        || (hist.type === 'effect' && state.filters.toggle.effects)
        || (hist.type.split(' ')[0] === 'subscription' && state.filters.toggle.subscriptions);

      const showFilter = search
        ? (hist.name.toLowerCase().includes(search) || !!(hist.props || {})[state.filters.search])
        : true;

      return showType && showFilter;
    })
    .map((hist, index, self) => {
      const next = self[index + 1];
      const relativeTime = next
        ? hist.timestamp - next.timestamp
        : null;

      return { ...hist, timestampOffset: relativeTime };
    });
};

const getInspectorSubscriptions = (state) => {
  const historyItem = state.history.find(h => h.id === state.browsing.historyId);
  if (!historyItem) return [];

  return historyItem.subscriptions;
};

export const create = (node) => app({
  init: actions.INITIAL_STATE,
  
  view: state => h(
    'div',
    {
      class: rootClasses(state),
    },
    [
      Container([
        Header(H1(text('Events')), [
          h('label', { class: 'mr-2' }, [
            h('input', {
              type: 'checkbox',
              value: 'actions',
              class: ['mr-1 border-b'],
              checked: state.filters.toggle.actions,
              oninput: (state, event) => {
                event.preventDefault();
                return actions.SetFilterToggle(state, { filter: event.target.value, value: event.target.checked });
              },
            }),
            text('Actions')
          ]),
          h('label', { class: 'mr-2' }, [
            h('input', {
              type: 'checkbox',
              value: 'effects',
              class: ['mr-1 border-b'],
              checked: state.filters.toggle.effects,
              oninput: (state, event) => {
                event.preventDefault();
                return actions.SetFilterToggle(state, { filter: event.target.value, value: event.target.checked });
              },
            }),
            text('Effects')
          ]),
          h('label', { class: 'mr-2' }, [
            h('input', {
              type: 'checkbox',
              value: 'subscriptions',
              class: ['mr-1 border-b'],
              checked: state.filters.toggle.subscriptions,
              oninput: (state, event) => {
                event.preventDefault();
                return actions.SetFilterToggle(state, { filter: event.target.value, value: event.target.checked });
              },
            }),
            text('Subscriptions')
          ]),
          h('input', {
            type: 'search',
            placeholder: 'filter',
            class: 'border border-gray-300 py-1 px-2',
            value: state.filters.search,
            oninput: (state, event) => {
              event.preventDefault();
              return actions.SetFilterSearch(state, event.target.value);
            },
          }),
        ]),
        h(
          'div',
          { class: 'flex-grow overflow-y-auto border-r border-gray-400 pl-2 py-2' },
          selectHistory(state).map(history => HyperappEvent(history, history.id === state.browsing.historyId)),
        ),
      ]),
      state.browsing.historyId && Container([
        Header(
          H1(text('Inspector')),
          h('button', {
            type: 'button',
            class: 'border border-gray-200 rounded p-1 px-2 bg-gray-600 text-gray-100 w-full shadow',
            onclick: (state, event) => {
              event.preventDefault();
              return actions.SelectBrowsingHistoryId(state, null);
            }
          }, text('Collapse >')),
        ),
        
        h('details', { class: 'flex-shrink', open: state.browsing.expand.state }, [
          h('summary', { class: 'text-md font-bold '}, text('State')),
          h('pre', { innerHTML: state.stateForDisplay })
        ]),
        
        h('details', { class: 'flex-shrink', open: state.browsing.expand.subscriptions }, [
          h('summary', { class: 'text-md font-bold '}, text('Subscriptions')),
          h(
            'ul',
            {},
            getInspectorSubscriptions(state).map(sub => h(
              'li',
              {
                class: 'mb-2 py-1 px-2 bg-yellow-200 text-gray-600'
              },
              text(sub.label)
            ))
          ),
        ]),
      ]),
    ]
  ),

  subscriptions: (_state) => [
    ChromeRuntimeConnection({
      onHistoryAdd: actions.AddHistoryItem,
      onHistoryReset: actions.ResetHistory,
    }),
  ],
  
  node,
});
