import { h } from '../hyperapp.js';
import * as actions from '../actions.js';

export const quickControls = ({ inspectedEventIndex, eventIndex, isPaused }) => [
  h('button', {
    disabled: inspectedEventIndex === 0,
    onclick: [actions.InspectEventIndex, 0]
  }, 'Rewind'),

  h('button', {
    disabled: inspectedEventIndex === 0,
    onclick: [actions.InspectEventIndex, inspectedEventIndex - 1]
  }, 'Step Back'),

  h('button', {
    disabled: !!isPaused,
    onclick: [actions.InspectEventIndex, inspectedEventIndex]
  }, 'Pause'),

  h('button', {
    disabled: inspectedEventIndex === eventIndex,
    onclick: [actions.InspectEventIndex, inspectedEventIndex + 1]
  }, 'Step Forward'),

  h('button', {
    disabled: inspectedEventIndex === eventIndex,
    onclick: [actions.InspectEventIndex, eventIndex]
  }, 'Fast-Forward'),

  ' | ',

  h('button', {
    disabled: !isPaused,
    onclick: actions.UnpauseApp,
  }, 'Resume'),
];
