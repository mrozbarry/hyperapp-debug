import { app, h } from './hyperapp.js';

const context = typeof browser !== 'undefined' ? browser : chrome;
console.log('panel.context', { context });

const Init = () => [
  {
    events: [],
  },
  OutgoingMessageFx({}),
];

const EventsAdd = (state, message) => ({ ...state, events: state.events.concat(message) });
const EventsClear = (state) => ({ ...state, events: [] });

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

const IncomingMessage = (dispatch, props) => {
  const onMessage = (message) => {
    console.log('Devtool:IncomingMessage#onMessage', message);
    switch (message.type) {
      case 'event':
        return dispatch(props.onEvent, message.payload);

      case 'reset-events':
        return dispatch(props.onReset);
    }
  };

  context.runtime.onMessage.addListener(onMessage);

  return () => {
    context.runtime.onMessage.removeListener(onMessage);
  };
};
const IncomingMessageFx = props => [IncomingMessage, props];

const OutgoingMessage = (_dispatch, props) => {
  context.runtime.sendMessage({
    type: 'devtool',
    props,
  });
};

const OutgoingMessageFx = props => [OutgoingMessage, props];

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: Init,
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
      IncomingMessageFx({ onEvent: EventsAdd , onReset: EventsClear }),
    ],
    node: document.body,
  });
});
