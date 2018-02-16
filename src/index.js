import { h } from 'hyperapp';
import * as Explorer from './Explorer'
import './index.styl';

const debugState = {
  expanded: true,
  contractedCounter: 0,
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
      contractedCounter: state.contractedCounter + 1,
    };
  },

  resume: () => state => {
    if (!state.appActions || !state.isTimeTravelling) return;

    const idx = state.states.length - 1;
    console.log('Resuming', idx, state);
    console.log(state.states[idx]);

    state.appActions.$debugSetState(state.states[idx]);

    return {
      isTimeTravelling: false,
      stateIdx: idx,
      states: state.states,
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

  toggleExpanded: () => state => ({
    expanded: !state.expanded,
    contractedCounter: state.expanded ? 0 : state.contractedCounter,
    isTimeTravelling: state.expanded ? state.isTimeTravelling : true,
  }),

  explorer: Explorer.actions,
};

const debugView = (state, actions) => (
  <div id="hyperapp-debugger" class={state.expanded ? 'expanded' : null}>
    <div class="ticker">
      <div class="text" style={{ backgroundColor: '#c0392b' }}>{state.contractedCounter}</div>
      <div
        class="button text"
        style={{
          backgroundColor: '#34495e',
          cursor: 'pointer',
        }}
        onclick={actions.toggleExpanded}
      >
        Expand
      </div>
    </div>
    <div class="full">
      <header>
        <h1>Hyperapp Debugger</h1>
        <div class="button" onclick={actions.toggleExpanded}>Hide</div>
      </header>
      <div style={{ display: 'flex', width: '100%' }}>
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
          style={{ flexGrow: 1 }}
        />
        <div style={{ flexShrink: 1 }}>{state.stateIdx}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div
          class="button pause"
          disabled={state.isTimeTravelling}
          onclick={() => actions.timeTravelTo(state.states.length - 1)}
        >
          Pause
        </div>
        <div
          class="button resume"
          disabled={!state.isTimeTravelling}
          onclick={actions.resume}
        >
          Resume
        </div>
      </div>
      <div id="hyperapp-debugger-explorer">
        {state.states.length > 0 && Explorer.view(state.states[state.stateIdx], actions.explorer)}
      </div>
    </div>
  </div>
);

export default (app) => (appState, appActions, appView, ...rest) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const debug = app(debugState, debugActions, debugView, div);

  const realApp = app(
    { ...appState, $debugSkipUpdate: false },
    { ...appActions, $debugSetState: state => state },
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
  debug.pushState(appState);

  return realApp;
};
