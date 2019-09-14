import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';

const basicEvent = (type, name) => h('div', { class: 'event' }, [
  h('span', null, name),
]);

const eventWithType = event => basicEvent(event.type, event.name);
const eventViews = {
  action: eventWithType,
  effect: eventWithType,
  'subscription/start': eventWithType,
  'subscription/stop': eventWithType,
};
const eventView = event => eventViews[event.type](event);

const eventList = ({ title, events }) => h('section', {}, [
  h('strong', null, title),
  h('div', { style: { display: 'flex', flexDirection: 'row' } }, events.map(eventView)),
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
  console.log('uniqueSubs', allSubs);
  return Array.from(new Set(allSubs));
};

const streamBase = ({ events, type, render, onEventClick  }) => h('section', {
  class: 'stream',
  style: {
    gridTemplateColumns: 'repeat(${Math.min(events.length, 100)}, 130px)',
  },
}, events.map((event, index) => h('button', {
    disabled: !!!onEventClick,
    onclick: onEventClick && onEventClick(event, index + 1),
    class: 'stream-item',
    style: {
      gridColumnStart: index + 1,
    },
  }, event[type] && render(event[type]))),
);

const stream = ({ events, type }) => streamBase({ events, type, render: eventView });

const subStreamRender = subName => event => event.name === subName && eventView(event);
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

      return h('body', null, [
        h('h1', null, 'Hyperapp Debug V2'),
        h('article', null, [
          h('section', null, [
            h('h2', null, 'Events'),
            h('div', { class: 'stream-container' },
              stream({
                events,
                type: 'action',
                onEventClick
              })
            ),
            h('div', { class: 'stream-container' }, stream({ events, type: 'effect' })),
            ...subs.map(subName => h('div', { class: 'stream-container' },
              streamSub({ events, subName }),
            )),
          ]),
        ]),
      ]);
    },
    subscriptions: () => [
      effects.handleMessages({
        event: actions.EventsAdd,
        'message:page-unload': actions.EventsClear,
      }),
    ],
    node: document.body,
  });
});
