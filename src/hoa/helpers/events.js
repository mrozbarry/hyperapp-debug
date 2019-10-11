import { flattenEffects } from './flattenEffects';

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

export const makeActionEvent = (action, props) => ({ type: 'action', name: action.name, props });
export const makeEffectEvent = ([effect, props]) => ({ type: 'effect', name: effect.name, props });
export const makeEffectEvents = (effectDefinition) => flattenEffects(effectDefinition).map(makeEffectEvent);
export const makeCommitEvent = (state) => ({ type: 'commit', state });
export const makeSubStartEvent = ([effect, props]) => ({ type: 'subscription/start', name: effect.name, props });
export const makeSubStopEvent = ([effect, props]) => ({ type: 'subscription/stop', name: effect.name, props });

export const makeEvents = (action, props) => {
  switch (typeOfAction(action)) {
  case 'action':
    return [
      makeActionEvent(action, props),
    ];

  case 'commit':
    return [
      makeCommitEvent(action),
    ];

  case 'effect':
    return [
      ...makeEffectEvents(action),
    ];

  case 'commit+effect':
    return [
      ...makeEvents(action[0]),
      ...makeEvents(action[1]),
    ];
  }
}

