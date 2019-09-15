import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';

const basicEvent = (event) => event && h('div', { class: 'event' }, [
  h('span', null, event.name),
]);

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: actions.Init,
    view: state => {
      const subs = Object.keys(state.streams.subscription);

      const iter = Array.from({ length: state.eventIndex + 1 });

      const commit = state.streams.commit[state.inspectedEventIndex]
      const inspectedState = commit
        ? commit.state
        : {};

      return h('body', null, [
        h('h1', null, 'Hyperapp Debug V2'),
        h('article', null, [
          h('button', null, 'Rewind'),
          h('button', null, 'Step Back'),
          h('button', null, 'Play'),
          h('button', null, 'Pause'),
          h('button', null, 'Step Forward'),
          h('button', null, 'Fast-Forward'),
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
                      onclick: [actions.InspectEventIndex, actions.decodeActionClick],
                      'data-eventindex': index,
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
              )
            ),
          ]),
          h('section', { class: 'layout-inspector' }, [
            h('h2', null, 'Inspector'),
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
        // 'event:action': actions.EventsAddActionOrEffect,
        // 'event:effect': actions.EventsAddActionOrEffect,
        'message:page-unload': actions.Init,
      }),
    ],
    node: document.body,
  });
});
