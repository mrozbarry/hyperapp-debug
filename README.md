# <img height=24 src=https://cdn.rawgit.com/JorgeBucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> Hyperapp Debug

[![Travis CI](https://img.shields.io/travis/mrozbarry/hyperapp-debug.svg)](https://travis-ci.org/mrozbarry/hyperapp-debug)
[![npm](https://img.shields.io/npm/v/hyperapp-debug.svg)](https://www.npmjs.com/package/hyperapp-debug)
[![Discord](https://img.shields.io/discord/804672552348680192)](https://discord.gg/QxY8SEVBsz)

A debugger for your [Hyperapp](https://github.com/hyperapp/hyperapp) applications.

## What is it

[hyperapp-debug](https://github.com/mrozbarry/hyperapp-debug) is a debugger for your hyperapp development flow.
It gives you insight into state transitions, when effects are fired, or if you have stubborn subscriptions.

## Hyperapp V1

If you are debugging Hyperapp V1 applications, check out [the legacy debugger](https://github.com/mrozbarry/hyperapp-debug/tree/hyperapp-v1-debugger).

## Installation

Install with npm or Yarn.

<pre>
npm i <a href=https://www.npmjs.com/package/hyperapp-debug>hyperapp-debug</a>
</pre>

Then with a module bundler like [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org), use as you would anything else.

```js
import { app, h } from 'hyperapp';
import { debuggable } from 'hyperapp-debug';
```

Or with `<script type="module">` and unpkg:

```js
import { app, h } from 'https://unpkg.com/hyperapp?module=1';
import { debuggable } from 'https://unpkg.com/hyperapp-debug?module=1';
```

If you don't want to set up a build environment, you can download Hyperapp Debug from a CDN like [unpkg.com](https://unpkg.com/hyperapp-debug), and it will be globally available through the <samp>window['hyperapp-debug'].default</samp> object.
hyperapp-debug supports all ES5-compliant browsers, including Internet Explorer 10 and above.

```html
<head>
  <script src="https://unpkg.com/hyperapp"></script>
  <script src="https://unpkg.com/hyperapp-debug"></script>
</head>
<body>
  <script>
    const { app, h } = window.hyperapp;
    const { debuggable } = window['hyperapp-debug'];
    // Your code here...
  </script>
</body>
```

## Usage

Use <samp>debuggable</samp> to wrap Hyperapp's <samp>app</samp> function.

```js
import { app } from 'hyperapp';
import { debuggable, adapters } from 'hyperapp-debug';

debuggable(app)({
  init: {},
  view: () => null,
  subscriptions: () => [],
  node: document.getElementById('your-app'),
  debug: {
    enable: true,
    adapter: adapters.ConsoleAdapter.use,
    id: 'your-custom-id',
  },
});
```

## Adapters

Check out the [Adapters](./docs/Adapters.md) documentation.

## History

For those coming from the elm community, you may notice much inspiration from Elm's time-travelling debugger :heart:.

## Contributing

Check out the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines for more information.

## License

Hyperapp Debug is MIT licensed. See [LICENSE.md](LICENSE.md).

## Other similar tools

 - [hyperapp-devtools](https://github.com/hyperstart/hyperapp-devtools)
