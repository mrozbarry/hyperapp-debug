import { h, app } from 'hyperapp';
import debug from '../src/index.js';

export const initialState = {
  counter: 0,
  now: new Date(),
  hist: [],
};

export const actions = {
  increm: () => state => ({ hist: state.hist.concat(state.counter), counter: state.counter + 1, now: new Date() }),
  decrem: () => state => ({ hist: state.hist.concat(state.counter), counter: state.counter - 1, now: new Date() }),
};

const view = (state, actions) => (
  <div>
    <h1>Counter: {state.counter} (Last changed {state.now.toISOString()}</h1>
    <button onclick={actions.decrem}>Decrement</button>
    <button onclick={actions.increm}>Increment</button>
  </div>
);

debug(app)(initialState, actions, view, document.body);
