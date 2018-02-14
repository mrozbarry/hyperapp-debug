import { h } from 'hyperapp';
import { isPlainObject } from 'lodash/fp';

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

export const view = (state, actions) => {
  return (
    <div style={{ fontFamily: 'monospace' }}>
      <ShowValue value={state} {...actions} />
    </div>
  );
};

const ShowValue = ({ exposedId, exposeVariable, _key, value, indent = 0 }) => {
  const makeAnchor = () => (
    typeof _key !== undefined
      ? <a
          href="#"
          onclick={(e) => {
            e.preventDefault();
            exposeVariable(value);
          }}
          style={{
            color: '#3498db',
          }}
        >
          {_key}
        </a>
      : null
  );

  if (isPlainObject(value)) {
    return (
      <div>
        {makeAnchor()} {'{'}
        <div style={{ paddingLeft: '1rem' }}>
          {Object.keys(value).filter(k => !k.startsWith('$debug')).map((k, idx) => (
            <ShowValue
              key={idx}
              exposeVariable={exposeVariable}
              _key={k}
              value={value[k]}
              indent={indent + 1}
            />
          ))}
        </div>
        {'}'}
      </div>
    )
  } else if (Array.isArray(value)) {
    return (
      <div>
        {makeAnchor()} {'['}
        <div style={{ paddingLeft: '1rem' }}>
          {value.map((v, idx) => (
            <ShowValue
              key={idx}
              exposeVariable={exposeVariable}
              _key={idx}
              value={v}
              indent={indent + 1}
            />
          ))}
        </div>
        {']'}
      </div>
    )
  }

  return (
    <div>
      {makeAnchor()} {JSON.stringify(value)}
    </div>
  )

  if (!isPlainObject(src) && !Array.isArray(src)) return null;

  const keys = Object.keys(src)
    .filter(key => !key.startsWith('$debug'));

  return keys.map((key, idx) => {
    return (
      <div key={parents.concat([key, idx]).join('.')} style={{ marginBottom: '5px', lineHeight: 1.5 }}>
        <div
          style={{
            display: 'inline-block',
            color: '#e74c3c',
            borderBottom: '1px #c0392b dotted',
            cursor: 'pointer',
          }}
          onclick={(e) => exposeVariable(src[key])}
        >
          {parents.concat(key).join('.')}
        </div>
        <div style={{ maxWidth: '400px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {JSON.stringify(src[key])}
        </div>

        <ShowValue
          exposeVariable={exposeVariable}
          src={src[key]}
          parents={parents.concat(key)}
        />
      </div>
    );
  });
}
