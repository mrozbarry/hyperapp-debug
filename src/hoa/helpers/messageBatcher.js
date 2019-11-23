const digOutEffects = (effect) => {
  if (!Array.isArray(effect)) {
    return [];
  }
  if (typeof effect[0] === 'function') {
    return [[{ effect: effect[0], props: effect[1] }]];
  }
  return effect.reduce((effects, effect) => {
    return [
      ...effects,
      ...digOutEffects(effect),
    ];
  }, []);
};

export default (onComplete) => {
  let buffer = {};
  let isFirst;

  const reset = () => {
    isFirst = false;
    buffer = {
      action: null,
      effects: [],
      state: null,
    };
  };

  const dispatch = (action, props) => {
    if (Array.isArray(action)) {
      if (typeof action[0] === 'function') {
        for (const effect of digOutEffects(action)) {
          buffer.effects.push(effect);
        }
        return;
      } else {
        buffer.state = action[0];
        for (const effect of digOutEffects(action[1])) {
          buffer.effects.push(effect);
        }
        return;
      }
    }
    if (typeof action === 'function') {
      reset();
      buffer.action = { action: { name: action.name }, props };
      return;
    }
    buffer.state = action;
  };

  const subscriptions = (subscriptionUpdates) => {
    const action = !buffer.action && isFirst
      ? { action: { name: 'Init' }, props: null }
      : buffer.action;

    onComplete({
      ...buffer,
      action,
      subscriptionUpdates,
    });

    reset();
  };

  reset();
  isFirst = true;

  return {
    dispatch,
    subscriptions,
  };
};

