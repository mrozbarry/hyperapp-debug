import { app, h, text } from 'hyperapp';
import { debuggable, adapters } from '../../hyperapp-debug.module.js';

// Basic Counter
const Delay = fxProps => [
  function DelayFx(dispatch, props) {
    setTimeout(() => {
      dispatch(props.action);
    }, props.delay);
  },
  fxProps,
];
const Add = state => ({ ...state, value: state.value + 1 });
const Sub = state => ({ ...state, value: state.value - 1 });
const AddWithDelay = state => [
  state,
  Delay({ delay: 1000, action: Add }),
];

// Interval Counter
const IntervalToggle = (state, { runInterval }) => ({ ...state, runInterval: state.runInterval ? null : runInterval });
const IntervalTick = state => ({ ...state, intervalValue: state.intervalValue + 1 });
function IntervalSub(dispatch, props) {
  const interval = setInterval(() => {
    dispatch(props.action);
  }, props.every);
  return () => {
    clearInterval(interval);
  };
};
const Interval = subProps => [
  subProps.good
    ? IntervalSub
    : function InlinedIntervalSub(dispatch, props) {
      const interval = setInterval(() => {
        dispatch(props.action);
      }, props.every);
      return () => {
        clearInterval(interval);
      };
    },
  subProps,
]

const Init = () => ({
  value: 0,
  runInterval: null,
  intervalValue: 0,
});

const box = (children = []) => h('div', { style: { margin: '8p16 0', borderLeft: '2px gray solid', padding: '16px', marginLeft: '8px' } }, children);
const testCase = ({ title, description }, children) => h('section', {}, [
  h('section', {}, [
    h('h2', {}, text(title)),
    h('p', {}, text(description)),
    box(children),
  ]),
]);

// const hyperappDebug = new HyperappDebug();

const mount = (debugId, node) => debuggable(app)({
  init: Init(),
  view: state => h('div', {}, h('article', {
    style: {
      paddingBottom: '0.5rem',
      marginBottom: '0.5rem',
      borderBottom: '1px #eee solid',
    },
  }, [
    h('h1', {}, text(debugId)),

    testCase({
      title: 'Basic Counter',
      description: 'Testing actions and commits',
    }, [
      h('button', { type: 'button', onclick: Sub }, text('-')),
      h('strong', { style: { padding: '0 1rem' } }, text(state.value.toString())),
      h('button', { type: 'button', onclick: Add }, text('+')),
      h('button', { type: 'button', onclick: AddWithDelay }, text('delayed +')),
    ]),

    testCase({
      title: 'Interval Counter',
      description: 'Testing effects via subscriptions',
    }, [
      h('strong', {}, text(state.intervalValue.toString())),
      state.runInterval && (
        h('button', { type: 'button', style: { display: 'block' }, onclick: IntervalToggle }, text(`Turn OFF Interval`))
      ),
      !state.runInterval && h('div', {}, [
        h('button', { type: 'button', style: { display: 'block' }, onclick: (state) => IntervalToggle(state, { runInterval: 'good' }) }, text(`Turn ON Good Interval`)),
        h('button', { type: 'button', style: { display: 'block' }, onclick: (state) => IntervalToggle(state, { runInterval: 'bad' }) }, text(`Turn ON Bad Interval`)),
      ]),
    ]),

  ])),
  subscriptions: state => [
    state.runInterval && Interval({ every: 1000, action: IntervalTick, good: state.runInterval === 'good' }),
  ],
  node,
  debug: {
    enable: true,
    id: debugId,
    adapter: adapters.ConsoleAdapter.use,
  },
});

mount('Test Bed 1', document.getElementById('app1'))
mount('Test Bed 2', document.getElementById('app2'))
//mount('Test Bed 3', document.getElementById('app3'))

