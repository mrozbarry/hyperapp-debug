# <img height=24 src=https://cdn.rawgit.com/JorgeBucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> Hyperapp Debug

[![Travis CI](https://img.shields.io/travis/mrozbarry/hyperapp-debug.svg)](https://travis-ci.org/mrozbarry/hyperapp-debug)
[![npm](https://img.shields.io/npm/v/hyperapp-debug.svg)](https://www.npmjs.com/package/hyperapp-debug)
[![Slack](https://hyperappjs.herokuapp.com/badge.svg)](https://hyperappjs.herokuapp.com "Join us")

A debugging high-order app for [Hyperapp](https://github.com/hyperapp/hyperapp).

## Installation

Install with npm or Yarn.

<pre>
npm i <a href=https://www.npmjs.com/package/hyperapp-debug>hyperapp-debug</a>
</pre>

Then with a module bundler like [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org), use as you would anything else.

```js
import { app, h } from 'hyperapp';
import withDebug from 'hyperapp-debug';
```

If you don't want to set up a build environment, you can download Hyperapp Debug from a CDN like [unpkg.com](https://unpkg.com/hyperapp-debug) and it will be globally available through the <samp>window['hyperapp-debug'].default</samp> object. We support all ES5-compliant browsers, including Internet Explorer 10 and above.

## Usage

Use <samp>debug</samp> to wrap Hyperapp's <samp>app</samp> function.

```js
import { app } from 'hyperapp';
import withDebug from 'hyperapp-debug';

withDebug(app)({
  init: {},
  view: () => null,
  subscriptions: () => [],
  node: document.getElementById('your-app'),
});
```

The debugger will only work if you also install the Firefox/Chrome Extension.

## History

For those coming from the elm community, you may notice much inspiration from [Elm's time-travelling debugger](http://debug.elm-lang.org/edit/Thwomp.elm).

## License

Hyperapp Debug is MIT licensed. See [LICENSE.md](LICENSE.md).

## Contributing

I'm currently using [web-ext](#todo), a Mozilla npm package for developing web extensions for Firefox (and Chrome, currently unsupported).
That means you should have the latest version of Firefox installed, if you want to take advantage of web-ext.

### With web-ext

```bash
yarn
yarn start
```

Also open a tab in the new Firefox instance to [about:debugging](about:debugging), click `This Firefox`, and then click the `Inspect` button for the Hyperapp dev tools extension.
The testbed app is meant to have minimal real-world-ish examples, and should be extended when there are missing use-cases.

### Without web-ext

In chrome, enable developer mode and load an unpacked extension, which ends up being [manifest.json](./src/browser-extension/manifest.json).
In firefox, open a tab in the new Firefox instance to [about:debugging](about:debugging), click `This Firefox`, and then click `Load Temporary Add-ons...`, and pick [manifest.json](./src/browser-extension/manifest.json).

```bash
yarn
yarn start:testbed
```
