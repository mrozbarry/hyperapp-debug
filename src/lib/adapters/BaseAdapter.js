export class BaseAdapter {
  constructor({ id, subscriptions }) {
    this.id = id || `hyperapp-debug_${Math.random().toString(36).slice(2)}`;
    this.paused = false;
    this.actions = [];
    this.currentAction = null;
    this.subscriptionsFn = subscriptions;
    this.originalDispatch = () => {};
    this.dispatch = this.dispatch.bind(this);
    this.subscriptions = this.subscriptions.bind(this);

    this.init();

    this.storeAction(
      function init() {},
      {},
    );
  }

  init() {
    console.log('Hyperapp Debug v2');
  }

  resume() {
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  dispatch(originalDispatch) {
    this.originalDispatch = originalDispatch;

    return (action, props) => {
      if (this.paused) return;

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
  }

  restoreFromAction(actionId) {
    const action = this.actions.find(a => a.id === actionId);
    if (!action) {
      return console.warn('Unable to restore state, action not found');
    }

    return this.originalDispatch(action.state);
  }

  onAction(_actionFn, _props, _id) {}
  onState(_state) {}
  onEffect(_effectFn, _props) {}
  onSubscriptions(_subs) {}

  storeAction(actionFn, props) {
    this.currentAction = {
      id: `${this.id}.${actionFn.name || 'action'}.${Date.now()}`,
      actionFn,
      props,
      state: null,
      effects: [],
      subscriptions: [],
    };
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

  subscriptions(state) {
    if (!this.subscriptionsFn) return [];

    const subs = this.subscriptionsFn(state);

    this.currentAction.subscriptions = subs;

    return subs;
  }
}
