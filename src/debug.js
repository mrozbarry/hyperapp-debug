import { h } from 'hyperapp';
import * as Explorer from './explorer'

export const initialState = {
  expanded: true,
  contractedCounter: 0,
  appActions: null,
  states: [],
  stateIdx: null,
  isTimeTravelling: false,
  ignoreNextState: false,
  explorer: Explorer.initialState,
};

export const actions = {
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

    const states = state.ignoreNextState
      ? state.states
      : state.states
        .slice(0, state.stateIdx + 1)
        .concat(newState);

    return {
      states,
      stateIdx: states.length - 1,
      isTimeTravelling: false,
      contractedCounter: state.contractedCounter + 1,
      ignoreNextState: false,
    };
  },

  resume: () => state => {
    if (!state.appActions || !state.isTimeTravelling) return;

    const idx = state.states.length - 1;

    state.appActions.$debugSetState(state.states[idx]);

    return {
      isTimeTravelling: false,
      stateIdx: idx,
      ignoreNextState: true,
    }
  },

  detachResume: () => (state, actions) => {
    if (!state.appActions || !state.isTimeTravelling) return;

    const states = state.states.slice(0, state.stateIdx + 1)

    actions.resume();

    return { states };
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
  }),

  export: event => state => {
    event.preventDefault();

    const e = document.createElement('a');
    e.style = 'display: none;';
    document.body.appendChild(e);

    const blob = new Blob([
      JSON.stringify(state.states),
    ], { type: 'octet/stream' });
    e.href = window.URL.createObjectURL(blob);
    e.download = 'app-states.json';
    e.click();
    window.URL.revokeObjectURL(e.href);
    e.remove();
  },

  import: event => (state, actions) => {
    const fr = new FileReader()

    fr.onload = (readerEvent) => {
      console.log(readerEvent);
      actions.resetAndSetStates(JSON.parse(readerEvent.target.result));
    }

    fr.readAsText(event.target.files[0])
  },

  resetAndSetStates: states => state => ({
    ...initialState,
    appActions: state.appActions,
    states: states,
    stateIdx: states.length > 0 ? 0 : null,
  }),

  explorer: Explorer.actions,
};

const ticker = (state, actions) => (
  h('div', {
    class: 'ticker',
  }, [
    h('div', { class: 'text', style: { backgroundColor: '#c0392b' } }, [state.contractedCounter]),
    h('div', {
      class: 'button text',
      style: {
        backgroundColor: '#34495e',
        cursor: 'pointer',
      },
      onclick: actions.toggleExpanded,
    }, [
      'Expand',
    ])
  ])
);

const expanded = (state, actions) => (
  h('div', { class: 'full' }, [
    h('header', {}, [
      h('h1', {}, ['Hyperapp Debugger']),
      h('div', {
        class: 'button',
        onclick: actions.toggleExpanded,
      }, ['Hide']),
    ]),

    h('div', { class: 'controls' }, [
      h('input', {
        class: 'time-travel',
        type: 'range',
        disabled: state.states.length === 0,
        min: 0,
        max: state.states.length - 1,
        step: 1,
        value: state.stateIdx,
        oninput: e => actions.timeTravelTo(Number(e.target.value)),
      }),
      h('div', { class: 'current-time' }, [state.stateIdx]),
    ]),

    h('div', { class: 'controls' }, [
      state.isTimeTravelling && state.stateIdx !== (state.states.length - 1) &&
        h('div', {
          class: 'button detach',
          onclick: actions.detachResume,
          title: 'Resume interactivity, but from the current state',
        }, ['Detach']),
      h('div', {
        key: 'playback',
        class: ['button playback', state.isTimeTravelling ? 'resume' : 'pause'].join(' '),
        onclick: () => (
          state.isTimeTravelling
            ? actions.resume()
            : actions.timeTravelTo(state.states.length - 1)
        ),
        title: 'Toggle debug mode.',
      }),
    ]),

    h('div', {
      id: 'hyperapp-debugger-explorer',
    }, [
      state.states.length > 0 && Explorer.view(state.states[state.stateIdx], actions.explorer)
    ]),

    h('div', {
      class: 'external',
    }, [
      h('a', { href: '#', onclick: actions.export }, ['Export']),
      ' / ',
      h('label', { for: 'hyperapp-debug-import' }, ['Import']),
      h('input', {
        id: 'hyperapp-debug-import',
        style: { outline: 'none', width: 0, height: 0 },
        type: 'file',
        onchange: actions.import,
      }),
    ])
  ])
);

export const view = (state, actions) => (
  h('div', {
    class: ['container', state.expanded ? 'expanded' : ''].join(' ')
  }, [
    ticker(state, actions),
    expanded(state, actions),
  ])
);
