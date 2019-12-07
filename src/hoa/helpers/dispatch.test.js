import sinon from 'sinon';

import { browserTest } from '../../support/jsdom';
import * as dispatchHelper from './dispatch';

const TestAction = () => {};
const testProps = { foo: 'bar' };

browserTest('serialize can serialize an action and props', (t) => {
  t.deepEqual(dispatchHelper.serialize(TestAction, testProps), {
    action: { type: 'function', name: 'TestAction' },
    props: {
      foo: 'bar',
    },
  });
});

browserTest('serialize gives a minimal event object', (t) => {
  t.plan(1);

  const element = window.document.createElement('input');
  element.value = 'foo';

  element.addEventListener('input', (e) => {
    t.deepEqual(dispatchHelper.serialize(TestAction, e), {
      action: { type: 'function', name: 'TestAction' },
      props: {
        target: {
          id: '',
          className: '',
          value: element.value,
          checked: false,
        },
        currentTarget: {
          id: '',
          className: '',
          value: element.value,
          checked: false,
        },
      },
    });
  });

  const inputEvent = window.document.createEvent('Event');
  inputEvent.initEvent('input', true, true);
  element.dispatchEvent(inputEvent);
});

browserTest('serialize fails when it cannot serialize', (t) => {
  sinon.replace(console, 'warn', () => {});
  t.deepEqual(dispatchHelper.serialize(TestAction, undefined), {
    action: { type: 'function', name: 'TestAction' },
    props: undefined,
  });
  sinon.restore();
});

browserTest('uses a fixed name for anonymous functions', (t) => {
  t.deepEqual(dispatchHelper.serialize(() => {}, testProps), {
    action: { type: 'function', name: '<Anonymous Function>' },
    props: testProps,
  });
  sinon.restore();
});

browserTest('prefers to serialize function with _name property if present', (t) => {
  const SomeAction = () => {};
  SomeAction._name = 'withHOF(SomeAction)';
  t.deepEqual(dispatchHelper.serialize(SomeAction, testProps), {
    action: { type: 'function', name: 'withHOF(SomeAction)' },
    props: testProps,
  });
  sinon.restore();
});
