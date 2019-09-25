import { app, h } from './hyperapp.js';
import * as actions from './actions.js';
import * as effects from './effects/index.js';
import { quickControls } from './components/quickControls.js';
import currentEventIndex from './helpers/currentEventIndex.js';

const basicEvent = (event) => event && h('div', { class: 'event' }, [
  h('span', null, event.label),
]);

document.addEventListener('DOMContentLoaded', () => {
  const eventHandlers = {
    'dispatch': actions.ProcessDispatch,
    'subscriptions': actions.CommitDispatch,
    'init': actions.Init,
  };
  app({
    init: actions.Init,
    view: state => {
      const subs = Object.keys(state.streams.subscription);

      const eventLength = currentEventIndex(state);

      const iter = Array.from({ length: eventLength + 1 });

      const eventIndex = state.inspectedEventIndex === null
        ? eventLength
        : state.inspectedEventIndex;


      const commit = state.streams.commit[eventIndex]
      const inspectedState = commit
        ? commit.state
        : {};

      return h('body', null, [
        h('article', { class: 'layout' }, [
          h('section', { class: 'layout-events' }, [
            h('article', { class: 'controls' }, [
                ...quickControls({
                  inspectedEventIndex: eventIndex,
                  eventIndex: eventLength,
                  isPaused: state.isPaused,
                }),
            ]),
            h('div', { class: 'stream-container' },
              h('section', {
                class: 'stream',
                style: {
                  //gridTemplateColumns: `repeat(${iter.length}, 130px)`,
                  gridTemplateRows: `repeat(${2 + subs.length}, 32px)`,
                },
              },
              iter.reduce((elements, _, index) => {
                const action = state.streams.action[index];
                const effect = state.streams.effect[index];
                const subscriptions = subs.map(subName => (
                  state.streams.subscription[subName][index]
                ));
                return [
                  ...elements,
                  action && h('button', {
                    onclick: [actions.InspectEventIndex, index],
                    class: {
                      'stream-item': true,
                      'stream-item--active': index === eventIndex,
                    },
                    style: {
                      gridColumnStart: index + 1,
                      gridRowStart: 1,
                    },
                  }, basicEvent(action)),
                  effect && h('div', {
                    class: 'stream-item',
                    style: {
                      gridColumnStart: index + 1,
                      gridRowStart: 2,
                    },
                  }, basicEvent(effect)),
                  ...subscriptions.map((subscription, subIndex) => (
                    subscription && h('div', {
                      class: 'stream-item',
                      style: {
                        gridColumnStart: index + 1,
                        gridColumnEnd: index + 1 + (subscription.ended ? subscription.timeSlices : (eventLength - index + 1)),
                        gridRowStart: 3 + subIndex,
                      },
                    }, basicEvent(subscription))
                  )),
                ];
              }, [])),
            // h('div', { class: 'stream-cursor' }),
            ),
          ]),
          h('section', { class: 'layout-inspector' }, [
            h('h2', null, 'Inspector', state.inspectedEventIndex),
            h('h3', null, 'Dispatched'),
            h('code', null, [
              h('pre', null, JSON.stringify({}, null, 2)),
            ]),
            h('h3', null, 'State'),
            h('code', null, [
              h('pre', null, JSON.stringify(inspectedState, null, 2)),
            ]),
          ]),
        ]),
      ]);
    },
    subscriptions: (state) => [
      effects.handleMessages({
        events: eventHandlers,
        isPaused: state.isPaused,
      }),
    ],
    node: document.body,
  });
});