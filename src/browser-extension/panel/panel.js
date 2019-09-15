import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';

const basicEvent = (event) => event && h('div', { class: 'event' }, [
  h('span', null, event.name),
]);

const orderedGroup = ({ groupedEvents }) => {
  const keys = Object.keys(groupedEvents).sort((a, b) => Number(a) - Number(b));
  return keys.map((key) => ({
    action: groupedEvents[key].find(e => e.type === 'action'),
    effect: groupedEvents[key].find(e => e.type === 'effect'),
    subscription: groupedEvents[key].find(e => e.type.startsWith('subscription')),
  }))
};

const uniqueSubs = ({ events }) => {
  const allSubs = events.filter(e => e.type === 'subscription/start').map(e => e.name);
  return Array.from(new Set(allSubs));
};

const streamBase = ({ events, type, render, onEventClick  }) => h('section', {
  class: 'stream',
  style: {
    gridTemplateColumns: 'repeat(${events.length}, 130px)',
  },
}, events.map((event, index) => h('button', {
    disabled: !!!onEventClick,
    onclick: onEventClick && onEventClick(event, index + 1),
    class: 'stream-item',
    style: {
      gridColumnStart: index + 1,
    },
  }, render(event[type]))),
);

const stream = ({ events, type }) => streamBase({ events, type, render: basicEvent });

const subStreamRender = subName => event => event.name === subName && basicEvent(event);

const streamSub = ({ events, subName }) => streamBase({
  events,
  type: 'subscription',
  render: subStreamRender(subName),
});

const onActionClickMake = (event, index) => {
  return function onActionClick(state, props) {
    console.log('action clicked', { event, index, props });
    return state;
  };
};

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: actions.Init,
    view: state => {
      const events = orderedGroup(state);
      const subs = uniqueSubs(state);

      const iter = Array.from({ length: state.eventIndex + 1 });

      return h('body', null, [
        h('h1', null, 'Hyperapp Debug V2'),
        h('article', null, [
          h('section', null, [
            h('h2', null, 'Events'),
              h('div', { class: 'stream-container' },
                h('section', {
                  class: 'stream',
                  style: {
                    gridTemplateColumns: 'repeat(${events.length}, 130px)',
                    gridTemplateRows: 'repeat(2, 32px)',
                  },
                },
                iter.reduce((elements, _, index) => {
                  const action = state.streams.action[index];
                  const effect = state.streams.effect[index];
                  return [
                    ...elements,
                    action && h('div', {
                      class: 'stream-item',
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
                  ]
                }, []),
              )
              // stream({
              //   events,
              //   type: 'action',
              //   onEventClick: onActionClickMake
              // })
            ),
            // h('div', { class: 'stream-container' }, stream({ events, type: 'effect' })),
            // ...subs.map(subName => h('div', { class: 'stream-container' },
            //   streamSub({ events, subName }),
            // )),
          ]),
        ]),
      ]);
    },
    subscriptions: () => [
      effects.handleMessages({
        'events': actions.EventsAdd,
        // 'event:action': actions.EventsAddActionOrEffect,
        // 'event:effect': actions.EventsAddActionOrEffect,
        // 'message:page-unload': actions.EventsClear,
      }),
    ],
    node: document.body,
  });
});
