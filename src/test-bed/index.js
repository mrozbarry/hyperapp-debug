import { app, h } from 'hyperapp';
import { Http, Interval } from 'hyperapp-fx';
import { debug } from '../hoa/index.js';

const LOAD_STATUS = {
  pending: 'pending',
  success: 'success',
  error: 'error',
};

const loadable = (status, data) => [LOAD_STATUS.success, LOAD_STATUS.error].indexOf(status) >= 0 ? [status, data] : [status, null];
const loadablePending = () => loadable(LOAD_STATUS.pending);
const loadableSuccess = data => loadable(LOAD_STATUS.success, data);
const loadableError = err => loadable(LOAD_STATUS.error, err);
const loadableGet = (loadableTuple, on = {}) => {
  const fn = on[loadableTuple[0]] || (() => null);
  return fn(loadableTuple[1]);
};

// Basic Counter
const Add = state => ({ ...state, value: state.value + 1 });
const Sub = state => ({ ...state, value: state.value - 1 });

// Quotes
const SetQuoteOK = (state, response) => ({
  ...state,
  quote: loadableSuccess(response.content), 
});
const SetQuoteERR = (state, response) => ({
  ...state,
  quote: loadableError(`Status ${response.status}`)
});
const GetQuote = state => [
  {
    ...state,
    quote: loadablePending(),
  },
  Http({
    url: 'https://api.quotable.io/random',
    action: SetQuoteOK,
    error: SetQuoteERR,
  }),
];

// Interval Counter
const IntervalToggle = state => ({ ...state, runInterval: !state.runInterval });
const IntervalTick = state => ({ ...state, intervalValue: state.intervalValue + 1 });

const Init = () => GetQuote({
  value: 0,
  quote: loadablePending(),
  runInterval: false,
  intervalValue: 0,
});

const box = (children) => h('div', { style: { margin: '8p16 0', borderLeft: '2px gray solid', padding: '16px', marginLeft: '8px' } }, children);
const testCase = ({ title, description }, children) => h('section', null, [
  h('section', null, [
    h('h2', null, title),
    h('p', null, description),
    box(children),
  ]),
]);

const kill = debug(app)({
  init: Init,
  view: state => h('article', null, [
    h('h1', null, 'Hyperapp Debug Testbed'),

    testCase({
      title: 'Basic Counter',
      description: 'Testing actions and commits',
    }, [
      h('button', { type: 'button', onclick: Sub }, '-'),
      h('strong', null, state.value),
      h('button', { type: 'button', onclick: Add }, '+'),
    ]),

    testCase({
      title: 'Quote Loader',
      description: 'Testing effects',
    }, [
      loadableGet(state.quote, {
        pending: () => h('div', null, '...'),
        success: quote => h('quote', null, quote),
        error: err => h('div', null, `ERROR: ${err.toString()}`),
      }),
      h('button', { type: 'button', style: { display: 'block' }, onclick: GetQuote }, 'Get Quote'),
    ]),

    testCase({
      title: 'Interval Counter',
      description: 'Testing effects via subscriptions',
    }, [
      h('strong', null, state.intervalValue),
      h('button', { type: 'button', style: { display: 'block' }, onclick: IntervalToggle }, state.runInterval ? 'Turn OFF Interval' : 'Turn ON Interval'),
    ]),

  ]),
  subscriptions: state => [
    state.runInterval && Interval({ every: 1000, action: IntervalTick })
  ],
  node: document.getElementById('app'),
});

