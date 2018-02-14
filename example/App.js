import { h } from 'hyperapp';
import debug from '../src/index.js';

export const initialState = {
  counter: 0,
  test: new Date(),
  more: { foo: "bar" },
  wow: [1, 2, 3, 4],
};

export const actions = {
  increm: () => state => ({ counter: state.counter + 1 }),
  decrem: () => state => ({ counter: state.counter - 1 }),
};

const view = (state, actions) => (
  <div>
    <h1>Counter: {state.counter}</h1>
    <button onclick={actions.increm}>Increment</button>
    <button onclick={actions.decrem}>Decrement</button>
  </div>
);

debug(initialState, actions, view, document.body);
