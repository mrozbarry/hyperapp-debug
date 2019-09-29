import { h } from './hyperapp.js';

const setOnRootState = (state, update) => ({
  ...state,
  ...update,
});

const getOnRootState = state => state;

const defaultActionProps = {
  get: getOnRootState,
  set: setOnRootState,
};

const condenseOpenedPaths = (openedPaths) => openedPaths.reduce((condensed, path) => {
  const containedIndex = condensed.findIndex(c => path.startsWith(c));
  return containedIndex === -1
    ? condensed.concat(path)
    : condensed.filter(c => !path.startsWith(c)).concat(path);
}, []);

const removeOpenedPath = (openedPaths, path) => {
  const child = path.split('.').slice(0, -1).join('.');

  return openedPaths.filter(op => !op.startsWith(path)).concat(child ? child : []);
};

export const OpenPath = (state, path) => ({
  ...state,
  openedPaths: condenseOpenedPaths([
    ...state.openedPaths,
    path,
  ]),
});

export const ClosePath = (state, path) => ({
  ...state,
  openedPaths: removeOpenedPath(state.openedPaths, path),
});

const defaults = {
  colors: {
    string: 'red',
    number: 'blue',
    boolean: 'green',
    constructor: '#f0f',
    null: 'gray',
  },
  actions: {
    open: OpenPath,
    close: ClosePath,
  },
  indentation: '2rem',
  openedPaths: [],
};

const renderValueWithConstructor = (type, value, props) => [
  h('span', {
    style: {
      color: props.colors.constructor,
    }
  }, type || 'Unknown Type'),
  ' ',
  value,
];

const renderNonPrimitive = (value, props) => {
  return h('span', {
    style: {
      borderBottom: '1px #aaa dotted',
      cursor: 'help',
    },
    title: 'This is a non-primitive object that may contain more data',
  }, renderValueWithConstructor(value.constructor.name, value.toString(), props));
};

const renderValueObject = (value, props, path) => {
  const type = Array.isArray(value) ? 'Array' : 'Object';
  const braces = type === 'Array'
    ? ['[', ']']
    : ['{', '}'];
  const sizeLabel = type === 'Array' ? 'item' : 'key';

  const keys = Object.keys(value);

  const isRoot = path.length === 1;

  const currentPath = path.join('.');
  const isExpanded = isRoot || props.openedPaths.some(op => op.startsWith(currentPath));

  const expanded = h('div', {
    style: {
      paddingLeft: props.indentation,
    },
  }, Object.keys(value).map((key) => (
    h('div', null, [
      h('span', null, `${key}:`),
      ' ',
      renderValueByType(value[key], props, path.concat(key)),
    ])
  )));

  const contracted = h('em', null, `${keys.length} ${sizeLabel}${keys.length === 1 ? '' : 's'}`)

  return renderValueWithConstructor(type, [
    h('span', null, braces[0]),
    !isRoot && h('button', {
      type: 'button',
      style: {
        border: 'none',
        background: 'none',
        textAlign: 'left',
        fontSize: '100%',
        lineHeight: 1,
        padding: 0,
        margin: 0,
        marginRight: '4px',
        textDecoration: 'underline',
        color: 'blue',
        cursor: 'pointer',
      },
      onclick: isExpanded
        ? [props.actions.close, currentPath]
        : [props.actions.open, currentPath],
    }, isExpanded ? 'collapse' : 'expand'),
    (isExpanded ? expanded : contracted),
    h('span', null, braces[1]),
  ], props);
};


const renderValueByType = (value, props, path) => {
  switch (typeof value) {
  case 'string':
    return h('span', {
      style: {
        color: props.colors.string,
      },
    }, renderValueWithConstructor(value.constructor.name, `"${value}"`, props));

  case 'number':
    return h('span', {
      style: {
        color: props.colors.number,
      },
    }, renderValueWithConstructor(value.constructor.name, value.toString(), props));

  case 'boolean':
    return h('span', {
      style: {
        color: props.colors.boolean,
      },
    }, renderValueWithConstructor(value.constructor.name, value.toString(), props));

  case 'object': {
    if (Array.isArray(value)) {
      return renderValueObject(value, props, path);

    } else if (value === null) {
      return h('span', {
        style: {
          color: props.colors.null,
        },
      }, 'null');

    } else if (value === (void 0)) {
      return 'undefined';
    }
    // Shamelessly ripped off from risan's is-plain-obj repository
    // https://github.com/risan/is-plain-obj
    const prototype = Object.getPrototypeOf(value);
    if (prototype === null || prototype === Object.getPrototypeOf({})) {
      return renderValueObject(value, props, path);
    }
  }

  default:
    // FIXME: Should hyperapp be filtering non-primitives for us? It seems like it is, and is that okay?
    return renderNonPrimitive(value, props);
  }
};

export const view = (props = {}) => {
  const options = {
    ...defaults,
    ...props,
    colors: {
      ...defaults.colors,
      ...props.colors,
    },
    actions: {
      ...defaults.actions,
      ...props.actions,
    },
  };

  return h('div', {
    style: {
      fontFamily: 'sans-serif',
      fontSize: '16px',
    },
  }, renderValueByType(props.value, options, ["<root>"]));
};
