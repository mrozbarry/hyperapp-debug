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
import { debug } from 'hyperapp-debug';
```

If you don't want to set up a build environment, you can download Hyperapp Debug from a CDN like [unpkg.com](https://unpkg.com/hyperapp-debug) and it will be globally available through the <samp>window['hyperapp-debug'].default</samp> object. We support all ES5-compliant browsers, including Internet Explorer 10 and above.

## Usage

Use <samp>debug</samp> to wrap Hyperapp's <samp>app</samp> function.

```js
import { app } from 'hyperapp';
import { debug } from 'hyperapp-debug';
import { state, actions, view } from './your-app.js';

debug(app)(state, actions, view);
```

## History

For those coming from the elm community, you may notice much inspiration from [Elm's time-travelling debugger](http://debug.elm-lang.org/edit/Thwomp.elm).

## Notes

 1. As part of wrapping the app function, Hyperapp Debug injects `$debugSetState` into your actions object to forcefully set the state of your app.
 2. `debug(app)` should probably not be used in production, since it will allow users to inspect your state, it may expose information you don't want exposed.

## Examples

 - [Hyperapp todo list with debug](https://codepen.io/mrozbarry/pen/JpMPrK)
 - [Hyperapp tweet with debug](https://codepen.io/mrozbarry/pen/zRjvOV)

## License

Hyperapp Debug is MIT licensed. See [LICENSE.md](LICENSE.md).
