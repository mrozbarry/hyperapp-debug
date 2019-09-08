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

const makeEvent = (type, happenedAt) => ({ type, happenedAt });
const makeActionEvent = (happenedAt, action, props) => ({ ...makeEvent('action', happenedAt), name: action.name, props });
const makeEffectEvent = (happenedAt, [effect, props]) => ({ ...makeEvent('effect', happenedAt), name: effect.name, props });
const makeCommitEvent = (happenedAt, state) => ({ ...makeEvent('commit', happenedAt), state });

const recordEvents = (happenedAt, action, props, on = {}) => {
  switch (typeOfAction(action)) {
    case 'action':
      return [
        makeActionEvent(happenedAt, action, props),
      ];

    case 'effect':
      return [
        makeActionEvent(happenedAt, action),
      ];

    case 'commit+effect':
      return [
        makeCommitEvent(happenedAt, action[0]),
        makeEffectEvent(happenedAt, action[1]),
      ];

    case 'commit':
      return [
        makeCommitEvent(happenedAt, action),
      ];
  }
}

export const middleware = dispatch => {
  const appStart = Date.now();

  return (action, props) => {
    const events = recordEvents(Date.now() - appStart, action, props);
    for(const e of events) {
      console.log(e);
    }
    return dispatch(action, props);
  };
};

export const debug = app => (props) => {
  const outerMiddleware = props.middleware || (dispatch => dispatch);
  const outerSubscriptions = props.subscriptions || (state => []);
  let subscriptions = undefined;
  if (props.subscriptions) {
    subscriptions = state => {
      const subs = props.subscriptions(state);
      for(const sub of subs) {
        if (!sub) {
          continue;
        }
        console.log('sub', sub[0].name, sub[0].constructor, { name: sub[0].name, props: sub[1] });
      }
      return subs;
    };
  }
    

  return app({
    ...props,
    subscriptions,
    middleware: dispatch => outerMiddleware(middleware(dispatch)),
  });
};
