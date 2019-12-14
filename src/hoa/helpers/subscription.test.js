import test from 'ava';
import sinon from 'sinon';
import { wrap } from './subscription';

const state = {};

const FakeFX = () => () => {};
const Fake = props => [FakeFX, props];

test.before(() => {
  global.window = { Event: class {} };
});

test('wrap returns a new subscription method', (t) => {
  const callback = sinon.fake();

  const subscriptions = wrap(undefined, callback);

  subscriptions(state);
  t.deepEqual(callback.lastCall.args, [[]]);
});

test('wrap polyfills subscription method from user if omitted', (t) => {
  const callback = sinon.fake();
  const subscriptionsFromUser = () => [];

  const subscriptions = wrap(subscriptionsFromUser, callback);

  t.is(typeof subscriptions, 'function');
});

test('wrap calls callback with active subscription array (empty)', (t) => {
  const userSubMethod = sinon.fake.returns([]);
  const callback = sinon.fake();

  const subscriptions = wrap(userSubMethod, callback);

  subscriptions(state);

  t.deepEqual(userSubMethod.lastCall.args, [state]);
  t.deepEqual(callback.lastCall.args, [[]]);
});

test('wrap always submits a flattened array of subscription effects', (t) => {
  const subscriptionOutputs = [
    [],
    [Fake(1)],
    [Fake(1)],
    [Fake(2)],
  ];
  const userSubMethod = () => {
    return subscriptionOutputs.shift();
  };
  const callback = sinon.fake();

  const subscriptions = wrap(userSubMethod, callback);

  subscriptions(state);
  t.deepEqual(callback.lastCall.args, [
    []
  ]);

  subscriptions(state);
  t.deepEqual(callback.lastCall.args, [
    [
      [{ type: 'function', name: 'FakeFX' }, 1],
    ]
  ]);

  subscriptions(state);
  t.deepEqual(callback.lastCall.args, [
    [
      [{ type: 'function', name: 'FakeFX' }, 1],
    ]
  ]);

  subscriptions(state);
  t.deepEqual(callback.lastCall.args, [
    [
      [{ type: 'function', name: 'FakeFX' }, 2],
    ]
  ]);
});
