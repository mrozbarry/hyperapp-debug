import { raw } from '../effects/messageDevTool';

let buffer = [];

export const push = (events) => {
  buffer.push(...([].concat(events)));
};

export const flush = () => {
  const result = [...buffer];
  buffer = [];
  return result;
};

export const emit = (eventName, type, eventIndex, payload) => {
  raw(eventName, type, eventIndex, payload);
};
