import { h } from '../hyperapp.js';

export const compatibilityWarning = () => h('div', {
  class: 'compatibility-warning'
}, [
  h('span', null, `The version of hyperapp-debug in the current application you are debugging may not be fully supported on this version of Hyperapp Devtools.`),
  h('span', null, `Please make sure you're using the latest DevTool release, and the latest hyperapp-debug version in your package.json`),
  h('div', { class: 'links' }, [
    h('div', null, [
      'The firefox extension: ',
      h('a', { href: 'https://addons.mozilla.org/en-CA/firefox/addon/hyperapp-debug-dev-tools/' }, 'addons.mozilla.org/.../hyperapp-debug-dev-tools')
    ]),
    h('div', null, [
      'The npm package: ',
      h('a', { href: 'https://www.npmjs.com/package/hyperapp-debug' }, 'npmjs.com/package/hyperapp-debug')
    ]),
  ]),
]);

