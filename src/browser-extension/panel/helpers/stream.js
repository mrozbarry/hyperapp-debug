const isAction = ({ action }) => action && action.type === 'function';
const isEffect = ({ action }) => Array.isArray(action) && action[0].type === 'function';
const isStateEffect = ({ action }) => Array.isArray(action) && action[0].type !== 'function' && Array.isArray(action[1]);

export const typeOfAction = (event) => {
  if (!event) return null;
  if (isAction(event)) {
    return 'action';
  } else if (isEffect(event)) {
    return 'effect';
  } else if (isStateEffect(event)) {
    return 'commit+effect';
  }
  return 'commit';
};

export const splitQueue = (queue) => {
  return queue.reduce((memo, event) => {
    const type = typeOfAction(event);
    if (type === 'commit+effect') {
      return {
        ...memo,
        commit: event.action[0],
        effect: event.action[1],
      };
    }
    return {
      ...memo,
      [type]: event,
    };
  }, {
    action: null,
    commit: null,
    effect: null,
  });
};
