import * as panel from './panel.js';

const element = document.querySelector('#debugger');

panel.create(element);

const _triggerEvent = (type, payload) => {
  const event = new CustomEvent('hyperapp-debug', {
    detail: {
      ...payload,
      type,
    },
  });

  element.dispatchEvent(event);
};

window.hyperappDebug = {
  trigger: {
    action: (name, props = {}, state = {}) => {
      _triggerEvent(
        'action',
        { name, props, state },
      );
    },
    effect: (name, props = {}) => {
      _triggerEvent(
        'effect',
        { name, props },
      );
    },
    subscriptions: (subscriptions = []) => {
      _triggerEvent(
        'subscriptions',
        { subscriptions },
      );
    },
  },
};

window.hyperappDebug.trigger.action('init', null, {});
