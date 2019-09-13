import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';

const basicEvent = (title, description) => h('section', { class: 'event' }, [
  h('strong', null, title),
  h('span', null, description),
]);

const eventWithType = event => basicEvent(event.type, event.name);
const eventViews = {
  action: eventWithType,
  effect: eventWithType,
  'subscription/start': eventWithType,
  'subscription/stop': eventWithType,
  commit: () => basicEvent('commit'),
};
const eventView = event => eventViews[event.type](event);

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: actions.Init,
    view: state => h('body', null, [
      h('h1', null, 'Hyperapp Debug V2'),
      h('article', null, [
        h('section', null, [
          h('h2', null, 'Events'),
          h('ol', null, state.events.map(e => h('li', null, eventView(e)))),
        ]),
        h('section', null, [
          h('h2', null, 'State Inspector'),

        ]),
      ]),
    ]),
    subscriptions: () => [
      effects.handleMessages({
        event: actions.EventsAdd,
        'reset-events': actions.EventsClear,
      }),
      effects.relayMessages(),
    ],
    node: document.body,
  });
});
