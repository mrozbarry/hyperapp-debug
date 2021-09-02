import { DevToolBridge } from './bridge/devtool.js';

const withDefault = (value, defaultValue) => {
  return value !==undefined
    ? value
    : defaultValue;
};

const makeId = () => Math.random().toString(36).slice(2);

export class HyperappDebug {
  constructor(options = {}) {
    this.options = {
      debug: withDefault(options.debug, true),
    };
    this.attached = false;
    this.debugName = `HyperappDebug_${makeId()}`;

    this.history = [];

    this._dispatch = () => {};
  }

  replay(id) {
    const record = this.history.find(h => h.id === id);
    if (!record) return;

    if (record.id.startsWith('Action#')) {
      this._dispatch(function HyperappDebug_ReplayAction() {
        return record.state;
      });
    } else if (record.id.startsWith('Effect#')) {
      this._dispatch(function HyperappDebug_ReplayEffect(state) {
        return [
          state,
          [record.effect, record.props],
        ];
      });
    }
  }

  enhance(appFn) {
    return (appProps) => {
      this.debugName = appProps.debugName || this.debugName;
      this.bridge = new DevToolBridge(this.debugName);

      let lastAction = { name: 'hyperapp.app.init' };
      let lastActionProps = undefined;
      let lastState = undefined;
      let lastSubscriptions = [];

      const serialize = s => [s.name, JSON.stringify(s.props)].join('_');

      const subscriptionsDiff = (oldSubs, newSubs) => {
        const newSubsSerialized = newSubs.map(serialize);
        const stopped = oldSubs
          .filter(oldSub => {
            const oldSubSerialized = serialize(oldSub);
            return newSubsSerialized.every(nss => oldSubSerialized !== nss)
          });
        
        const oldSubsSerialized = oldSubs.map(serialize);
        const started = newSubs
          .filter(newSub => {
            const newSubSerialized = serialize(newSub);
            return oldSubsSerialized.every(oss => newSubSerialized !== oss)
          });
        
        return {
          stopped,
          started,
        };
      };

      const subscriptions = (state) => {
        const nextSubscriptions = appProps.subscriptions(state)
          .filter(Array.isArray);

        const { stopped, started } = subscriptionsDiff(lastSubscriptions, nextSubscriptions);
        console.log({ stopped, started });
        stopped.forEach(sub => this.history.push(this.bridge.subscription(sub, 'subscription stop', lastState)));
        started.forEach(sub => this.history.push(this.bridge.subscription(sub, 'subscription start', lastState)));

        lastSubscriptions = nextSubscriptions;
        return nextSubscriptions;
      };

      return appFn({
        init: appProps.init,
        view: appProps.view,
        subscriptions: appProps.subscriptions
          ? subscriptions
          : undefined,
        node: appProps.node,
        dispatch: (dispatchFn) => {
          this._dispatch = dispatchFn;

          this._dispatch = (action, props) => {
            const isAction = typeof action === 'function';
            const isStateEffectArray = Array.isArray(action);

            const isState = !isStateEffectArray
              && !isAction

            if (isState) {
              lastState = { ...action };
              this.history.push(
                this.bridge.action(lastAction, lastActionProps, lastState),
              );

            } else if (isAction) {
              lastAction = action;
              lastActionProps = props;

            } else if (isStateEffectArray) {
              const [state, ...effects] = action;
              console.log('lib/hyperappDebug.isStateEffectArray', state, effects);
              lastState = { ...state };
              this.history.push(
                this.bridge.action(lastAction, lastActionProps, lastState),
              );
              effects.forEach(fx => this.history.push(
                this.bridge.effect(fx),
              ));

            } else {
              console.log('Unknown dispatch format', action, props);

            }

            return dispatchFn(action, props);
          };

          return this._dispatch;
        },
      });
    };
  }
}
