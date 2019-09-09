import './global';

const isAction = (action) => typeof action === 'function';
const isEffect = (action) => Array.isArray(action) && typeof action[0] === 'function';
const isStateEffect = (action) => Array.isArray(action) && typeof action[0] !== 'function' && Array.isArray(action[1]);

const typeOfAction = (action) => {
  if (isAction(action)) {
    return 'action';
  } else if (isEffect(action)) {
    return 'effect';
  } else if (isStateEffect(action)) {
    return 'commit+effect';
  }
  return 'commit';
};

const makeActionEvent = (action, props) => ({ type: 'action', name: action.name, props });
const makeEffectEvent = ([effect, props]) => ({ type: 'effect', name: effect.name, props });
const makeCommitEvent = (state) => ({ type: 'commit', state });
const makeSubStartEvent = ([effect, props]) => ({ type: 'subcription/start', name: effect.name, props });
const makeSubStopEvent = ([effect, props]) => ({ type: 'subscription/stop', name: effect.name, props });

const recordEvents = (action, props, on = {}) => {
  switch (typeOfAction(action)) {
    case 'action':
      return [
        makeActionEvent(action, props),
      ];

    case 'effect':
      return [
        makeActionEvent(action),
      ];

    case 'commit+effect':
      return [
        makeCommitEvent(action[0]),
        makeEffectEvent(action[1]),
      ];

    case 'commit':
      return [
        makeCommitEvent(action),
      ];
  }
}

export const middleware = (appStart, broadcastEvent) => dispatch => {
  return (action, props) => {
    const happenedAt = Date.now() - appStart;
    const domSource = props instanceof Event ? { domSource: props.target } : {} ;
    const events = recordEvents(action, props).map(e => ({ ...e, happenedAt, ...domSource }));
    for(const e of events) {
      broadcastEvent(e);
    }
    return dispatch(action, props);
  };
};

export const flattenSubs = subs => {
  if (!Array.isArray(subs)) {
    return [];
  }

  return subs.reduce((flattened, sub) => {
    let nextSub = [];
    let children = [];
    if (Array.isArray(sub)) {
      if (typeof sub[0] === 'function') {
        nextSub = [sub];
      } else {
        children = flattenSubs(sub);
      }
    }
    return [
      ...flattened,
      ...nextSub,
      ...children,
    ];
  }, []);
}

const areObjectsShallowSame = (a, b) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const keys = Array.from(new Set([...aKeys, ...bKeys]));

  return !keys.some(k => a[k] != b[k]);
}

const recordSubEvents = (prevSubs, subs) => {
  const cancelled = [];
  const started = [];

  for (const prevSub of prevSubs) {
    const matches = subs.filter(s => s[0] === prevSub[0]);
    if (matches.length === 0) {
      cancelled.push(prevSub);
    }
  }
  for (const currSub of subs) {
    const prev = prevSubs.find(p => p[0] === currSub[0] && areObjectsShallowSame(p[1], currSub[1]));
    if (!prev) {
      started.push(currSub);
    }
  }

  return [
    ...cancelled.map(c => makeSubStopEvent(c)),
    ...started.map(s => makeSubStartEvent(s)),
  ]
};

export const debug = app => (props) => {
  const appStart = Date.now();

  const debugApp = window.__HYPERAPP_V2_DEBUG__.registerApp(props.node);

  const outerMiddleware = props.middleware || (dispatch => dispatch);
  const outerSubscriptions = props.subscriptions || (state => []);

  let subscriptions = undefined;
  if (props.subscriptions) {
    let prevSubs = [];
    subscriptions = state => {
      const happenedAt = Date.now() - appStart;
      const subs = props.subscriptions(state);
      const flattened = flattenSubs([...subs]);
      const events = recordSubEvents(prevSubs, flattened).map(e => ({ ...e, happenedAt }));
      for(const e of events) {
        debugApp.broadcastEvent(e);
      }
      prevSubs = flattened;
      return subs;
    };
  }


  return app({
    ...props,
    subscriptions,
    middleware: dispatch => outerMiddleware(middleware(appStart, debugApp.broadcastEvent)(dispatch)),
  });
};
