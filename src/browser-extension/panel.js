import { app, h } from 'hyperapp';

const Init = () => ({
  value: 0,
});

const MessageReceived = (state) => ({ ...state, value: state.value += 1 });

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

const Message = (dispatch, props) => {
  const port = browser.runtime.connect();

  const onMessage = ({ source, data }) => {
    if (source !== window) {
      return;
    }
    if (typeof data['$hyperapp_debug'] === 'undefined') {
      return;
    }
    dispatch(props.action, {});
  };

  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
  };
};
const MessageFx = props => [Message, props];

document.addEventListener('DOMContentLoaded', () => {
  app({
    init: Init,
    view: state => h('body', null, [
      h('h1', null, 'Hyperapp Debug V2'),
      h('div', null, `message count: ${state.value}`),
      // h('article', null, [
      //   h('section', null, [
      //     h('h2', null, 'Events'),
      //     h('ol', null, state.events.map(e => h('li', null, eventView(e)))),
      //   ]),
      //   h('section', null, [
      //     h('h2', null, 'State Inspector'),
      //
      //   ]),
      // ]),
    ]),
    subscriptions: state => [
      MessageFx({ action: MessageReceived }),
    ],
    node: document.body,
  });
});
