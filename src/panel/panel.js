import { app, h, text } from 'hyperapp';

import { HyperappEvent } from './components/HyperappEvent.js';
import { Container } from './components/Container.js';
import { Header } from './components/Header.js';

import { Listener } from './subscriptions/Listener.js';

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
    });
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
        Header('Events', [
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
            type: 'text',
            placeholder: 'filter',
            class: 'border border-gray-300 py-1 px-2',
            value: state.filters.search,
            oninput: (state, event) => {
              event.preventDefault();
              return actions.SetFilterSearch(state, event.target.value);
            },
          }),
          
          state.browsing.historyId && h('div', {
            class: 'absolute',
            style: {
              left: '50%',
              top: '120%',
              width: '260px',
              marginLeft: '-130px',
              overflow: 'visible',
            }
          }, [
            h('button', {
              type: 'button',
              class: 'border border-gray-200 rounded p-1 px-2 bg-gray-600 text-gray-100 w-full shadow',
              onclick: (state, event) => {
                event.preventDefault();
                return actions.SelectBrowsingHistoryId(state, null);
              }
            }, text('Resume Following Updates'))
          ])
        ]),
        h(
          'div',
          { class: 'flex-grow overflow-y-auto border-r border-gray-400 pl-2 py-2' },
          selectHistory(state).map(history => HyperappEvent(history, history.id === state.browsing.historyId)),
        ),
      ]),
      state.browsing.historyId && Container([
        Header('Inspector', []),
        
        h('details', { class: 'flex-shrink', open: state.browsing.expand.state }, [
          h('summary', { class: 'text-md font-bold '}, text('State')),
          h('pre', { innerHTML: state.stateForDisplay })
        ]),
        
        h('details', { class: 'flex-shrink', open: state.browsing.expand.subscriptions }, [
          h('summary', { class: 'text-md font-bold '}, text('Subscriptions')),
        ]),
      ]),
    ]
  ),

  subscriptions: (_state) => [
    Listener({
      rootElement: node,
      eventName: 'hyperapp-debug',
      onAction: actions.AddAction,
      onEffect: actions.AddEffect,
      onSubscriptions: actions.AddSubscriptions,
    }),
  ],
  
  node,
});
