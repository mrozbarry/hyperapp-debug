export const flattenEffects = effects => {
  if (!Array.isArray(effects)) {
    return [];
  }

  if (typeof effects[0] === 'function') {
    return [effects];
  }

  return effects.reduce((flattened, effect) => {
    let nextEffects = [];
    let children = [];
    if (Array.isArray(effect)) {
      if (typeof effect[0] === 'function') {
        nextEffects = [effect];
      } else {
        children = flattenEffects(effect);
      }
    }
    return [
      ...flattened,
      ...nextEffects,
      ...children,
    ];
  }, []);
};

