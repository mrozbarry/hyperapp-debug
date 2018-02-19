import test from 'ava';
import sinon from 'sinon';
import { state as initialState, actions, view } from './debug'

const runActions = transforms => (state, actions) =>
  transforms.reduce((nextState, transform) => {
    const modifier = transform(nextState, actions);
    return Object.assign({}, nextState, modifier);
  }, state);

test('view matches snapshot', ava => {
  ava.snapshot(view(initialState, actions));
});

test('state matches snapshot', ava => {
  ava.snapshot(initialState);
});

test('actions.importAppActions sets appActions', ava => {
  const testAppActions = { foo: bar => (state, actions) => { return { foo: bar } } }

  const state = runActions([
    actions.importAppActions(testAppActions),
  ])(initialState, actions);

  ava.deepEqual(state.appActions, testAppActions);
});

test('actions.pushState adds a new state to the states array', ava => {
  const externalState = { foo: 'bar' };

  const state = runActions([
    actions.pushState(externalState),
  ])(initialState, actions);

  ava.deepEqual(state.states, [externalState]);
  ava.is(state.contractedCounter, 1);
});

test('actions.resume does nothing when appActions are not set', ava => {
  const prevState = { appActions: null, isTimeTravelling: true, states: [1, 2, 3], stateIdx: 0 };
  const state = runActions([
    actions.resume(),
  ])(prevState, actions);

  ava.deepEqual(state, prevState);
});

test('actions.resume does nothing when isTimeTravelling is falsey', ava => {
  const prevState = { appActions: { $debugSetState: () => {} }, isTimeTravelling: false, states: [1, 2, 3], stateIdx: 0 };
  const state = runActions([
    actions.resume(),
  ])(prevState, actions);

  ava.deepEqual(state, prevState);
});

test('actions.resume updates isTimeTravelling, and stateIdx', ava => {
  const prevState = { appActions: { $debugSetState: () => {} }, isTimeTravelling: true, states: [1, 2, 3], stateIdx: 0 };
  const state = runActions([
    actions.resume(),
  ])(prevState, actions);

  ava.is(state.stateIdx, 2);
  ava.is(state.isTimeTravelling, false);
});

test('actions.timeTravelTo does nothing when appActions are not set', ava => {
  const $debugSetState = sinon.spy()
  const state = runActions([
    actions.importAppActions({ $debugSetState }),
    actions.pushState({ foo: 1 }),
    actions.pushState({ foo: 2 }),
    actions.pushState({ foo: 3 }),
    actions.timeTravelTo(0),
  ])(initialState, actions);

  ava.is(state.stateIdx, 0);
  ava.is(state.isTimeTravelling, true);
  ava.true($debugSetState.called);
});
