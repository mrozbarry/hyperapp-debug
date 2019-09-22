const functionMap = {};
const functionMapAdd = (parent, fn) => {
  if (!fn.name) {
    console.warn(`Encountered an illegal anonymous method used as an action or effect`);
    return;
  }
  const key = `${parent}.${fn.name}`;
  const old = functionMap[key];
  if (old && old !== fn) {
    console.warn(`Encountered two actions or effects named ${fn.name}, but different defintions, cannot continue serialization`);
    return;
  }
  functionMap[key] = fn;
};

const functionMapGet = (parent, { name }) => {
  const key = `${parent}.${name}`;
  return functionMap[key];
}

const fnToObject = (key, value) => {
  if (typeof value === 'function') {
    const serialized = { type: 'function', name: value.name };
    console.log('serializing a function as', serialized);
    functionMapAdd(key, value);
    return serialized;
  }
  return value;
};

const objectToFn = (key, value) => {
  if (value && value.type === 'function') {
    return functionMapGet(key, value);
  }
  return value;
}

const serializeObject = object => {
  if (!object) {
    return object;
  }
  if (object instanceof Event) {
    console.log('Cannot serialize event', object);
    return {};
  }
  try {
    return JSON.parse(JSON.stringify(object, fnToObject));
  } catch (err) {
    console.log('unable to serialize object', object);
    console.warn(err);
    return object;
  }
};

export const serialize = (action, props) => ({
  action: serializeObject(action),
  props: serializeObject(props),
});

export const deserialize = ({ action, props }) => {
  return {
    action: JSON.parse(JSON.stringify(action), objectToFn),
    props: props ? JSON.parse(JSON.stringify(props), objectToFn) : props,
  };
};
