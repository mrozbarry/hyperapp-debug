import { h } from 'hyperapp';

export const Container = (children) => h(
  'div',
  {
    class: [
      'max-h-auto md:max-h-full flex flex-col',
    ]
      
  },
  children,
);
