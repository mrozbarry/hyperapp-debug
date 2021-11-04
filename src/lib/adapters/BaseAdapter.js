export class BaseAdapter {
  constructor({ debugId, ...appProps }) {
    this.id = debugId || `hyperapp-debug_${Math.random().toString(36).slice(2)}`;
    this.appProps = appProps;
    this.paused = false;
    this.actions = [];
    this.currentAction = null;
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

  onResume() {}
  onPause() {}

  resume() {
    this.paused = false;
    this.onResume();
  }

  pause() {
    this.paused = true;
    this.onPause();
  }

  back(count = 1) {
    const currentIndex = this.actions.findIndex(a => a.id === this.currentAction.id);
    if (currentIndex === -1) return;
    this.pause();
    this.restoreFromAction(this.actions[Math.max(currentIndex - count, 0)].id);
  }

  forward(count = 1) {
    const currentIndex = this.actions.findIndex(a => a.id === this.currentAction.id);
    if (currentIndex === -1) return;
    this.pause();
    this.restoreFromAction(this.actions[Math.min(currentIndex + count, this.actions.length - 1)].id);
  }

  resumeFromHere() {
    const currentIndex = this.actions.findIndex(a => a.id === this.currentAction.id);
    if (currentIndex === -1) return;
    this.history = this.history.slice(0, currentIndex);
    this.end();
    this.resume();
  }

  resumeFromEnd() {
    this.forward(this.actions.length);
    this.resume();
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
    this.currentAction = action;

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
      timestamp: Date.now(),
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

  subscriptions(subscriptions) {
    if (!subscriptions) return undefined; 

    return (state) => {
      const subs = subscriptions(state);

      this.currentAction.subscriptions = subs;

      return subs;
    };
  }
}
