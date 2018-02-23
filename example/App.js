import { h, app } from 'hyperapp';
import debug from '../src/index.js';

export const initialState = {
  counter: 0,
  hist: [],
  text: "",
};

export const actions = {
  increm: () => state => ({ hist: state.hist.concat(state.counter), counter: state.counter + 1 }),
  decrem: () => state => ({ hist: state.hist.concat(state.counter), counter: state.counter - 1 }),
  setText: e => ({ text: e.target.value }),
};

const view = (state, actions) => (
  <div>
    <h1>Counter: {state.counter}</h1>
    <button onclick={actions.decrem}>Decrement</button>
    <button onclick={actions.increm}>Increment</button>
    <hr />
    <textarea value={state.text} oninput={actions.setText} />
  </div>
);

debug(app)(initialState, actions, view, document.body);
