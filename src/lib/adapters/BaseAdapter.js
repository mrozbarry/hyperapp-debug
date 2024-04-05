const makeId = () => Math.random().toString(36).slice(2, 8);

export const make = (name) => {
  const events = {
    log: [],
    debug: [],
    info: [],
    warn: [],
    error: [],
    onPause: [],
    onResume: [],
    onWarning: [],
    onAction: [],
    onState: [],
    onEffect: [],
    onSubscriptionStart: [],
    onSubscriptionEnd: [],
  };

  const schedule =
    window.requestIdleCallback || ((fn) => window.setTimeout(fn, 0));

  const self = {
    history: [],
    currentAction: {
      name: "",
      fn: null,
      props: null,
      state: null,
      effects: [],
    },
    historyIndex: null,
    pausedAt: null,
    parentDispatch: null,
  };

  const startAction = (fn, props, timestamp) => {
    self.currentAction = {
      name: fn.name,
      fn,
      props,
      state: null,
      effects: [],
      timestamp,
    };
  };

  const endAction = (state, effects = []) => {
    self.currentAction = {
      ...self.currentAction,
      state,
      effects,
    };
    self.history.push(self.currentAction);
  };

  self.offAll = (eventName) => {
    if (!(eventName in events)) return self;
    events[eventName] = [];
    return self;
  };
  self.off = (eventName, fn) => {
    if (!(eventName in events)) return self;

    const index = events[eventName].findIndex((setFn) => setFn === fn);
    events[eventName].splice(index, 1);
    return self;
  };
  self.on = (eventName, fn) => {
    if (!(eventName in events)) return self;

    events[eventName].push(fn);
    return self;
  };
  self.trigger = (eventName, ...params) => {
    if (!(eventName in events)) return self;

    const fns = events[eventName];
    fns.forEach((fn) =>
      schedule(() =>
        fn(
          `%c[%cHyperappDebug:%c${name}%c]`,
          "color: red;",
          "color: black",
          "color: blue;",
          "color: black;",
          ...params
        )
      )
    );
    return self;
  };

  self.timeTravelDispatch = (dispatch) => {
    self.parentDispatch = dispatch;
    return (action, props) => {
      if (pausedAt) {
        if (typeof action === "function") {
          console.warn(
            `Hyperapp Debugger has prevented ${name} from running an action (${action.name}) because this application is paused.`
          );
        }
        return;
      }

      const isActionWithProps = typeof action === "function";
      const isStateEffectTuple = Array.isArray(action);

      if (isActionWithProps) {
        startAction(fn, props, Date.now());
      } else if (isStateEffectTuple) {
        endAction(action[0], action.slice(1));
        self.trigger("onState", { state: action[0] });
        action
          .slice(1)
          .forEach((fx) =>
            self.trigger("onEffect", { fn: fx[0], props: fx[1] })
          );
      } else {
        endAction(action, []);
        self.trigger("onState", { state: action });
      }

      return dispatch(action, props);
    };
  };

  self.on("onAction", (entry) =>
    self.trigger("log", entry.name, entry.props, entry.fn)
  );
  self.on("onSubscriptionStart", (entry) =>
    self.trigger("log", entry.name, entry.props, entry.fn)
  );
  self.on("onState", (entry) => self.trigger("info", entry.state));

  self.pause = () => {
    if (!self.parentDispatch) {
      return self.trigger(
        "warn",
        "Unable to use timetravel features without augmenting hyperapp dispatch"
      );
    }
    self.pausedAt = Date.now();
    return self.trigger("onPause", self);
  };
  self.resume = () => {
    if (!self.parentDispatch) {
      return self.trigger(
        "warn",
        "Unable to use timetravel features without augmenting hyperapp dispatch"
      );
    }
    self.pausedAt = null;
    return self.trigger("onResume", self);
  };
  const timeTravelTo = (entry) => {
    if (!self.parentDispatch) {
      return self.trigger(
        "warn",
        "Unable to use timetravel features without augmenting hyperapp dispatch"
      );
    }
    if (!entry) {
      return self;
    }
    self.parentDispatch(entry.state);
    return self;
  };
  self.rewind = (step = 1) => {
    const index = self.historyIndex - step;
    return timeTravelTo(self.history[index]);
  };
  self.fastforward = (step = 1) => {
    const index = self.historyIndex + step;
    return timeTravelTo(self.history[index]);
  };

  return self;
};
