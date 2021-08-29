import { h, text } from 'hyperapp';

import * as actions from '../actions.js';

const classes = {
  'action': ['border-blue-600'],
  'effect': ['border-red-600'],
  'subscription': ['border-yellow-600'],
}

export const HyperappEvent = (event, isSelected) => h(
  'label',
  {
    class: [
      'p-1 py-2 mb-2 flex items-center justify-start',
      'border-l-4 border-b border-t',
      classes[event.type.split(' ')[0]],
    ]
  },
  [
    h('div', { class: 'flex-shrink mr-2' }, [
      h('input', {
        type: 'radio',
        name: 'event',
        value: event.id,
        checked: isSelected,
        onchange: (state, event) => {
          event.preventDefault();
          return actions.SelectBrowsingHistoryId(state, event.target.value);
        }
      }),
    ]),
    h('div', {}, [
      h('div', { class: 'text-normal leading-none' }, text(`${event.name}(${JSON.stringify(event.props)})`)),
      h('small', { class: 'text-xs uppercase text-gray-400 leading-none' }, text(event.type)),
    ]),
  ]
);
