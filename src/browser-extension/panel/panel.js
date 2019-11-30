import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';
import { quickControls } from './components/quickControls.js';
import currentEventIndex from './helpers/currentEventIndex.js';
import * as jsonView from './jsonView.js';

const basicEvent = (event, type) => event && h('div', {
  class: {
    'event': true,
    [`event-${type}`]: true,
  },
}, [
  h('span', null, event.label),
  h('div', { class: 'event-type' }, [
    event.faked ? 'Generated ' : '',
    type
  ]),
]);

const translateInspectableObject = (object) => {
  return JSON.parse(JSON.stringify(object), (key, value) => {
    if (value.type === 'function' && value.name) {
      const temp = { [value.name]: () => {} };
      return temp[value.name];
    }
    return value;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const eventHandlers = {
    'dispatch': actions.ProcessDispatch,
    'subscriptions': actions.CommitDispatch,
    //'init': actions.Init,
    'registrations': actions.SetRegistrations,
    'import': actions.ImportDispatches,
  };
  app({
    init: actions.Init,
    view: state => {
      const subs = Object.keys(state.streams.subscription);

      const eventLength = currentEventIndex(state);

      const iter = Array.from({ length: eventLength + 1 });

      const eventIndex = state.inspectedEventIndex === null
        ? eventLength
        : state.inspectedEventIndex;


      const commit = state.streams.commit[eventIndex];
      const inspectedState = commit
        ? commit.state
        : {};

      const action = state.streams.action[eventIndex];
      const inspectedAction = action
        ? action.props
        : {};

      const effect = state.streams.effect[eventIndex];
      const inspectedEffect = effect
        ? effect.props
        : {};

      const appList = [
        ...state.apps,
      ];

      const getAction = index => {
        if (index === 0 && !state.streams.action[index]) {
          return { label: 'Init', faked: true };
        }
        return state.streams.action[index];
      }

      return h('body', null, [
        h('article', { class: 'layout' }, [
          h('section', { class: 'layout-events' }, [
            h('article', { class: 'controls' }, [
              ...quickControls({
                inspectedEventIndex: eventIndex,
                eventIndex: eventLength,
                isPaused: state.isPaused,
              }),
              h('select', {
                onchange: actions.DebugApp,
              }, appList.map(app => h(
                'option',
                { value: app.appId, selected: app.appId === state.debugApp },
                app.appName
              ))),
            ]),
            h('div', { class: 'stream-container' },
              h('section', {
                class: 'stream',
                style: {
                  gridTemplateRows: `repeat(${2 + subs.length}, 38px)`,
                },
              },
              iter.reduce((elements, _, index) => {
                const action = getAction(index);
                const effect = state.streams.effect[index];
                const subscriptions = subs.map(subName => (
                  state.streams.subscription[subName][index]
                ));
                return [
                  ...elements,
                  action && h('button', {
                    onclick: [actions.InspectEventIndex, index],
                    class: {
                      'stream-item': true,
                      'stream-item--active': index === eventIndex,
                    },
                    style: {
                      gridColumnStart: index + 1,
                      gridRowStart: 1,
                    },
                  }, basicEvent(action, 'action')),

                  effect && h('div', {
                    class: 'stream-item',
                    style: {
                      gridColumnStart: index + 1,
                      gridRowStart: 2,
                    },
                  }, basicEvent(effect, 'effect')),

                  ...subscriptions.map((subscription, subIndex) => (
                    subscription && h('div', {
                      class: 'stream-item',
                      style: {
                        gridColumnStart: index + 1,
                        gridColumnEnd: index + 1 + (subscription.ended ? subscription.timeSlices : (eventLength - index + 1)),
                        gridRowStart: 3 + subIndex,
                      },
                    }, basicEvent(subscription, 'subscription'))
                  )),
                ];
              }, [])),
            ),
          ]),
          h('section', { class: 'layout-inspector' }, [
            h('h3', {
              style: {
                borderBottom: '1px #eee solid',
                padding: 0,
                margin: 0,
                paddingBottom: '4px',
                marginBottom: '4px',
              },
            }, 'State'),

            h('code', {
              style: {
                display: 'block',
                padding: '0 4px',
                margin: '8px 0',
                marginBottom: '16px',
              },
            }, [
              inspectedState && jsonView.view({
                value: inspectedState,
                openedPaths: state.appState.openedPaths,
                actions: {
                  open: (state, props) => ({
                    ...state,
                    appState: jsonView.OpenPath(state.appState, props)
                  }),
                  close: (state, props) => ({
                    ...state,
                    appState: jsonView.ClosePath(state.appState, props)
                  }),
                },
              }),
            ]),

            h('h3', {
              style: {
                borderBottom: '1px #eee solid',
                padding: 0,
                margin: 0,
                paddingBottom: '4px',
                marginBottom: '4px',
              },
            }, `Action<${action ? action.label : 'NONE'}>`),
            h('code', {
              style: {
                display: 'block',
                padding: '0 4px',
                margin: '8px 0',
                marginBottom: '16px',
              },
            }, [
              action && inspectedAction && jsonView.view({
                value: translateInspectableObject(inspectedAction),
                openedPaths: state.appAction.openedPaths,
                actions: {
                  open: (state, props) => ({
                    ...state,
                    appAction: jsonView.OpenPath(state.appAction, props)
                  }),
                  close: (state, props) => ({
                    ...state,
                    appAction: jsonView.ClosePath(state.appAction, props)
                  }),
                },
              }),
            ]),

            h('h3', {
              style: {
                borderBottom: '1px #eee solid',
                padding: 0,
                margin: 0,
                paddingBottom: '4px',
                marginBottom: '4px',
              },
            }, `Effect<${effect ? effect.label : 'NONE'}>`),
            h('code', {
              style: {
                display: 'block',
                padding: '0 4px',
                margin: '8px 0',
                marginBottom: '16px',
              },
            }, [
              effect && inspectedEffect && jsonView.view({
                value: translateInspectableObject(inspectedEffect),
                openedPaths: state.appEffect.openedPaths,
                actions: {
                  open: (state, props) => ({
                    ...state,
                    appEffect: jsonView.OpenPath(state.appEffect, props)
                  }),
                  close: (state, props) => ({
                    ...state,
                    appEffect: jsonView.ClosePath(state.appEffect, props)
                  }),
                },
              }),
            ]),

          ]),
        ]),
      ]);
    },
    subscriptions: (state) => [
      effects.handleMessages({
        events: eventHandlers,
        isPaused: state.isPaused,
      }),
    ],
    node: document.body,
  });
});
