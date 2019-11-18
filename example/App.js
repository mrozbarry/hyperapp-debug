const { h, app } = hyperapp;

const initialState = {
  counter: 0,
  hist: [],
  text: "",
};

const actions = {
  increm: () => state => ({ hist: state.hist.concat(state.counter), counter: state.counter + 1 }),
  decrem: () => state => ({ hist: state.hist.concat(state.counter), counter: state.counter - 1 }),
  setText: e => state => ({ text: e.target.value }),
};

const view = (state, actions) => (
  h('div', null, [
    h('h1', null, `Counter: ${state.counter}`),
    h('button', { onclick: actions.decrem }, 'Decrement'),
    h('button', { onclick: actions.increm }, 'Increment'),
    h('hr'),
    h('textarea', {
      value: state.text,
      oninput: actions.setText,
    })

  ])
);

withDebug(app)(initialState, actions, view, document.body);
