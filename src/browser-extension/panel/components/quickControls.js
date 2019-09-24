import { h } from '../hyperapp.js';
import * as actions from '../actions.js';

export const quickControls = ({ inspectedEventIndex, eventIndex, isPaused }) => [
  h('button', {
    class: 'button',
    disabled: inspectedEventIndex === 0,
    onclick: [actions.InspectEventIndex, 0]
  }, 'Rewind'),

  h('button', {
    class: 'button',
    disabled: inspectedEventIndex === 0,
    onclick: [actions.InspectEventIndex, inspectedEventIndex - 1]
  }, 'Step Back'),

  h('button', {
    class: 'button',
    disabled: !!isPaused,
    onclick: [actions.PauseApp, { isPaused: true }],
  }, 'Pause'),

  h('button', {
    class: 'button',
    disabled: inspectedEventIndex === eventIndex,
    onclick: [actions.InspectEventIndex, inspectedEventIndex + 1]
  }, 'Step Forward'),

  h('button', {
    class: 'button',
    disabled: inspectedEventIndex === eventIndex,
    onclick: [actions.InspectEventIndex, eventIndex]
  }, 'Fast-Forward'),

  ' | ',

  h('button', {
    class: 'button',
    disabled: !isPaused,
    onclick: [actions.PauseApp, { isPaused: false }],
  }, 'Resume'),
];
