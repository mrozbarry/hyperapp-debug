import { h } from 'hyperapp';

export const Header = (left, right) => h(
  'div',
  {
    class: [
      'flex-shrink flex items-start justify-start px-1 py-2 border-b border-gray-300 flex-col relative',
      'sm:items-center sm:justify-between sm:flex-row',
    ],
  },
  [
    h('div', {}, left),
    h('div', {}, right),
  ],
);
