import { flattenEffects } from './flattenEffects';
import { serialize } from './serialize';

export const wrap = (subscriptions, cb) => {
  return (state) => {
    const subs = subscriptions
      ? subscriptions(state)
      : [];

    const flattened = flattenEffects([...subs]);
    cb(serialize(flattened));

    return subs;
  };
};
