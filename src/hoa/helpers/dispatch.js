const fnToObject = (key, value) => {
  if (typeof value === 'function') {
    return {
      type: 'function',
      name: value._name || value.name || '<Anonymous Function>',
    };
  }
  return value;
};

const serializeEventTarget = target => ({
  id: target.id,
  className: target.className,
  value: target.value,
  checked: target.checked,
});

const serializeObject = object => {
  if (object instanceof window.Event) {
    return {
      target: serializeEventTarget(object.target),
      currentTarget: serializeEventTarget(object.currentTarget),
    };
  }
  try {
    return JSON.parse(JSON.stringify(object, fnToObject));
  } catch (err) {
    console.warn(err);
    return object;
  }
};

export const serialize = (action, props) => ({
  action: serializeObject(action),
  props: serializeObject(props),
});
