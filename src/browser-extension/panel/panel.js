import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';
import { quickControls } from './components/quickControls.js';

const basicEvent = (event) => event && h('div', { class: 'event' }, [
  h('span', null, event.name),
]);

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: actions.Init,
    view: state => {
      const subs = Object.keys(state.streams.subscription);

      const streamArray = name => state.streams[name] || [];

      const eventIndex = Math.max(
        streamArray('actions').length,
        streamArray('commit').length,
        streamArray('effects').length,
        ...Object.values(state.streams.subscription).map(s => s.length),
      ) - 1;

      const iter = Array.from({ length: eventIndex + 1 });

      const commit = state.streams.commit[state.inspectedEventIndex]
      const inspectedState = commit
        ? commit.state
        : {};

      return h('body', null, [
        h('article', null, [
          ...quickControls({
            inspectedEventIndex: state.inspectedEventIndex,
            eventIndex,
            isPaused: state.isPaused,
          }),
        ]),
        h('article', { class: 'layout' }, [
          h('section', { class: 'layout-events' }, [
            h('h2', null, 'Events'),
              h('div', { class: 'stream-container' },
                h('section', {
                  class: 'stream',
                  style: {
                    //gridTemplateColumns: `repeat(${iter.length}, 130px)`,
                    gridTemplateRows: `repeat(${2 + subs.length}, 32px)`,
                  },
                },
                iter.reduce((elements, _, index) => {
                  const action = state.streams.action[index];
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
                        'stream-item--active': index === state.inspectedEventIndex,
                      },
                      style: {
                        gridColumnStart: index + 1,
                        gridRowStart: 1,
                      },
                    }, basicEvent(action)),
                    effect && h('div', {
                      class: 'stream-item',
                      style: {
                        gridColumnStart: index + 1,
                        gridRowStart: 2,
                      },
                    }, basicEvent(effect)),
                    ...subscriptions.map((subscription, subIndex) => (
                      subscription && h('div', {
                        class: 'stream-item',
                        style: {
                          gridColumnStart: index + 1,
                          gridRowStart: 3 + subIndex,
                        },
                      }, basicEvent(subscription))
                    )),
                  ];
                }, []),
              ),
              // h('div', { class: 'stream-cursor' }),
            ),
          ]),
          h('section', { class: 'layout-inspector' }, [
            h('h2', null, 'Inspector', state.inspectedEventIndex),
            h('code', null, [
              h('pre', null, JSON.stringify(inspectedState, null, 2)),
            ])
          ]),
        ]),
      ]);
    },
    subscriptions: () => [
      effects.handleMessages({
        'events': actions.EventsAdd,
        'init': actions.Init,
      }),
    ],
    node: document.body,
  });
});
