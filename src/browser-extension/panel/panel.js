import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';

const basicEvent = (type, name) => h('div', { style: { border: '1px #efefef solid', marginRight: '0.5rem', padding: '0.1rem' } }, [
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

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: actions.Init,
    view: state => {
      const events = orderedGroup(state);

      return h('body', null, [
        h('h1', null, 'Hyperapp Debug V2'),
        h('article', null, [
          h('section', null, [
            h('h2', null, 'Events'),
            h('article', { style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(200px, ${events.length + 1})',
              gridTemplateRows: `50px 50px 50px`,
              overflow: 'auto',
              width: 'auto',
              maxWidth: '100vw',
            } }, [
              ...events.reduce((all, event, column) => {
                return [
                  ...all,
                  ...[event.action, event.effect, event.subscription].map((e, row) => e && h('div', {
                    style: {
                      gridColumnStart: column + 2,
                      gridRowStart: row + 1,
                      width: '200px',
                    },
                  }, eventView(e)))
                ];
              }, []),
              h('strong', { style: { gridColumnStart: 1, gridRowStart: 1 } }, 'Actions'),
              h('strong', { style: { gridColumnStart: 1, gridRowStart: 2 } }, 'Effects'),
              h('strong', { style: { gridColumnStart: 1, gridRowStart: 3 } }, 'Subscriptions'),
            ])
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
