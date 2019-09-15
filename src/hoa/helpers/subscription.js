import { makeSubStartEvent, makeSubStopEvent } from './events';

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

export const recordSubEvents = (prevSubs, subs) => {
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
