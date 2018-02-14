import { h, app } from 'hyperapp';
import * as Explorer from './Explorer'

const debugState = {
  appActions: null,
  states: [],
  stateIdx: null,
  isTimeTravelling: false,
  explorer: Explorer.initialState,
};

const debugActions = {
  importAppActions: appActions => state => {
    return { appActions };
  },

  pushState: newState => (state, actions) => {
    if (state.isTimeTravelling) {
      if (state.appActions) {
        state.appActions.$debugSetState(state.states[state.stateIdx]);
      }
      return;
    }

    const states = state.states
      .slice(0, state.stateIdx + 1)
      .concat(newState);

    return {
      states,
      stateIdx: states.length - 1,
      isTimeTravelling: false,
    };
  },

  resume: () => state => {
    if (!state.appActions) return;

    const idx = state.states.length - 1;

    state.appActions.$debugSetState(state.states[idx]);

    return {
      isTimeTravelling: false,
      stateIdx: idx,
      states: state.states.slice(0, -1),
    }
  },

  timeTravelTo: index => (state, actions) => {
    if (state.appActions) {
      state.appActions.$debugSetState(state.states[index]);
    }

    return {
      stateIdx: index,
      isTimeTravelling: true,
    };
  },

  explorer: Explorer.actions,
};

const debugSetState = state => _ => state;

const debugView = (state, actions) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      right: 0,
      backgroundColor: '#2c3e50',
      color: '#ecf0f1',
      padding: '15px',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      maxWidth: '300px',
    }}
  >
    <h1
      style={{
        fontSize: '18px',
      }}
    >Debugger</h1>
    <a
      disabled={!state.isTimeTravelling}
      href="#"
      style={{
        color: state.isTimeTravelling
          ? '#3498db'
          : '#e74c3c'
      }}
      onclick={() => actions.resume()}
    >Resume</a>
    <input
      type="range"
      disabled={state.states.length === 0}
      min={0}
      max={state.states.length - 1}
      step={1}
      value={state.stateIdx}
      oninput={e => {
        actions.timeTravelTo(Number(e.target.value));
      }}
      style={{ boxSizing: 'border-box', width: '100%' }}
    />
    {state.stateIdx}
    <hr />
    <div style={{ overflow: 'auto' }}>
      {state.states.length > 0 && Explorer.view(state.states[state.stateIdx], actions.explorer)}
    </div>
  </div>
);

export default (appState, appActions, appView, ...rest) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const debug = app(debugState, debugActions, debugView, container);

  const realApp = app(
    { ...appState, $debugSkipUpdate: false },
    { ...appActions, $debugSetState: debugSetState },
    (state, actions) => (
      <div
        onupdate={() => {
          debug.pushState(state);
        }}
      >
        {appView(state, actions)}
      </div>
    ),
    ...rest
  );

  debug.importAppActions(realApp);

  return realApp;
};
