import { h } from 'hyperapp';
import isPlainObject from 'lodash.isplainobject';

const maxArraySize = 10;

export const initialState = {
  exposeId: 1,
};

export const actions = {
  exposeVariable: variable => state => {
    const name = `$debug${state.exposeId}`
    console.log('[HyperDebug]', `window.${name}`);
    window[name] = variable
    console.log(window[name])
    return { exposeId: state.exposeId + 1 };
  },
};

export const view = (state, actions) => (
  <ShowValue value={state} {...actions} />
);

const ShowValue = ({ exposeVariable, name, value }) => {
  const makeAnchor = () => (
    typeof name !== undefined
      ? <a
          class="object-key"
          href="#"
          onclick={(e) => {
            e.preventDefault();
            exposeVariable(value);
          }}
        >
          {name}
        </a>
      : null
  );

  const wrappers = isPlainObject(value)
    ? '{}'
    : Array.isArray(value)
    ? '[]'
    : null

  let keys = Object.keys(value);
  let prependAll = '';

  if (Array.isArray(value) && value.length > maxArraySize) {
    const hidden = value.length - maxArraySize
    keys = keys.slice(-maxArraySize)
    prependAll = '...'
  }

  if (wrappers) {
    return (
      <div>
        {makeAnchor()} {wrappers[0]}
        <div class="object">
          {prependAll}
          {keys.filter(k => !k.startsWith('$debug')).map((k, idx) => (
            <ShowValue
              key={idx}
              exposeVariable={exposeVariable}
              name={k}
              value={value[k]}
            />
          ))}
        </div>
        {wrappers[1]}
      </div>
    )
  }

  return (
    <div>
      {makeAnchor()} {JSON.stringify(value)}
    </div>
  )
}
