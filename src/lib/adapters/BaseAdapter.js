const makeId = () => Math.random().toString(36).slice(2, 8);

export class BaseAdapter {
  constructor({ debug, ...appProps }) {
    this.id = debug.id || `hyperapp-debug_${Math.random().toString(36).slice(2)}`;
    this.appProps = appProps;
    this.paused = false;
    this.actions = [];
    this.currentAction = null;
    this.latestAction = null;
    this.originalDispatch = () => { };
    this.augmentedDispatch = () => { };
    this.dispatchOverride = this.dispatchOverride.bind(this);
    this.subscriptionsOverride = this.subscriptionsOverride.bind(this);

    this.init();

    this.storeAction(
      function init() { },
      undefined,
    );
  }

  init() {
    console.log('Hyperapp Debug v2');
  }

  onResume() { }
  onPause() { }
  onWarning(_warning) { }

  history() {
    return [...this.actions];
  }

  dispatch(actionFn, props, recorded = true) {
    return recorded
      ? this.augmentedDispatch(actionFn, props)
      : this.originalDispatch(actionFn, props);
  }

  resume() {
    this.paused = false;
    this.onResume();
  }

  pause() {
    this.paused = true;
    this.onPause();
  }

  state() {
    return { ...this.currentAction.state };
  }

  subscriptions() {
    return [...this.currentAction.subscriptions.sequence];
  }

  back(count = 1) {
    let action = this.currentAction;
    for (let num = 0; num < count && action; num++) {
      action = action.previousAction || action;
    }
    this.pause();
    return this.restoreFromAction(action);
  }

  alternateFutures() {
    const { nextActions }  = this.currentAction;
    return Object.keys(nextActions).reduce((futures, key) => ({
      ...futures,
      [key]: {
        state: nextActions[key].state,
        timestamp: nextActions[key].timestamp,
        pick: () => this.forward(1, key),
      },
    }), {});
  }

  forward(count = 1, actionIdStream = undefined) {
    let action = this.currentAction;
    for (let num = 0; num < count && action; num++) {
      const nextActions = Object.values(action.nextActions);
      if (nextActions.length === 1) {
        action = nextActions[0];
      } else if (nextActions.length > 1) {
        if (!action.nextActions[actionIdStream]) {
          console.warn('Unable to time-travel forward without picking a future stream action id')
          break;
        }
        action = action.nextActions[actionIdStream] || action;
      }
    }
    this.pause();
    return this.restoreFromAction(action);
  }

  resumeHere() {
    if (this.lastAction !== this.currentAction) {
      console.warn('Creating a new future stream from the current action');
      this.latestAction = this.currentAction;
    }
    this.resume();
  }

  restoreFromAction(action) {
    this.currentAction = action;

    this.dispatch(action.state, undefined, false);
    return action.state;
  }

  dispatchOverride() {
    return (originalDispatch) => {
      this.originalDispatch = originalDispatch;

      this.augmentedDispatch = (action, props) => {
        if (this.paused) {
          if (typeof action === 'function') {
            console.warn(`Hyperapp Debugger has prevented ${this.id} from running an action (${action.name}) because this application is paused.`);
          }
          return;
        }

        const isActionWithProps = typeof action === 'function';
        const isStateEffectTuple = Array.isArray(action);

        if (isActionWithProps) {
          this.storeAction(action, props);
        } else if (isStateEffectTuple) {
          this.storeState(action[0]);

          action.slice(1).forEach(fx => this.storeEffect(fx));
        } else { // just a state update
          this.storeState(action);
        }

        return originalDispatch(action, props);
      };

      return this.augmentedDispatch;
    };
  }

  onAction(_actionFn, _props, _id) { }
  onState(_state) { }
  onEffect(_effectFn, _props) { }
  onSubscriptions(_subs, _details) { }

  storeAction(actionFn, props) {
    const previousAction = this.latestAction;
    const id = `${actionFn.name || 'action'}.${Date.now()}`;

    this.currentAction = {
      previousAction,
      nextActions: {},
      id,
      actionFn,
      props,
      state: null,
      effects: [],
      subscriptions: {
        sequence: [],
        started: [],
        stabilized: [],
        stopped: [],
      },
      timestamp: Date.now(),
    };

    if (previousAction) {
      previousAction.nextActions[id] = this.currentAction;
    }
    this.latestAction = this.currentAction;

    this.actions.push(this.currentAction);
    this.onAction(actionFn, props, this.currentAction.id);
  }

  storeState(state) {
    this.currentAction.state = state;
    this.onState(state);
  }

  storeEffect(effect) {
    this.currentAction.effects.push(effect);
    this.onEffect(effect[0], effect[1]);
  }

  subscriptionsOverride() {
    if (!this.appProps.subscriptions) return undefined;

    const sameProps = (a, b) => Object.keys({ ...a, ...b }).every(k => a[k] == b[k]);

    return (state) => {
      const nextSubs = this.appProps.subscriptions(state);

      const sequence = nextSubs
        .filter(s => s)
        .map(([effect, props]) => ({
          effect,
          props,
          id: makeId(),
          count: 1,
        }));

      const stopped = this.actions.length > 1
        ? [...this.actions[this.actions.length - 2].subscriptions.sequence.filter(s => s)]
        : [];

      const started = [];
      const stabilized = [];

      for (let nextIndex = 0; nextIndex < sequence.length; nextIndex++) {
        const nextSub = sequence[nextIndex];
        if (!nextSub) continue;

        const prevIndex = stopped.findIndex(({ effect, props }) => (
          nextSub.effect === effect
          && sameProps(nextSub.props, props)
        ));

        if (prevIndex >= 0) {
          const stabilizedSub = stopped.splice(prevIndex, 1);
          stabilized.push({
            ...stabilizedSub,
            count: stabilizedSub.count + 1,
          });
        } else if (prevIndex === -1) {
          started.push(nextSub);
        }
      }

      this.currentAction.subscriptions = {
        sequence,
        started,
        stabilized,
        stopped,
      };

      stopped
        .filter(({ effect, props, count }) => {
          if (count > 1) return;
          return started.some(s => (
            s.effect.name === effect.name
            && sameProps(props, s.props)
            && s.count === 1
            && s.effect.toString() === effect.toString()
          ));
        })
        .forEach((badSub) => {
          this.onWarning(
            `A subscription (${badSub.effect.name}) is frequently restarting. This may be from an inline subscription effect function.`,
            {
              badSub,
              function: badSub.effect.toString()

            },
          );
        });

      this.onSubscriptions(this.currentAction.subscriptions.sequence, this.currentAction.subscriptions)

      return nextSubs;
    };
  }
}
