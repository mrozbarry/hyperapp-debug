import { h, text } from 'hyperapp';

export const Header = (title, controls) => h(
  'div',
  {
    class: [
      'flex-shrink flex items-start justify-start py-2 border-b border-gray-300 flex-col relative',
      'sm:items-center sm:justify-between sm:flex-row',
    ],
  },
  [
    h('h1', { class: 'text-lg font-bold' }, text(title)),
    h('div', {}, controls)
  ],
);
