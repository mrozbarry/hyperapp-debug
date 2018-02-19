# <img height=24 src=https://cdn.rawgit.com/JorgeBucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> Hyperapp Debug

![](https://img.shields.io/npm/l/hyperapp-debug.svg)
[![](https://img.shields.io/npm/v/hyperapp-debug.svg)](https://www.npmjs.com/package/hyperapp-debug)
[![](https://img.shields.io/travis/mrozbarry/hyperapp-debug.svg)](https://travis-ci.org/mrozbarry/hyperapp-debug)

A high-order app wrapper for debugging your application's state.

## Installation

Install with your favorite node package manager:

```bash
npm install --save-dev hyperapp-debug
# Or
yarn add --dev hyperapp-debug
```

And import it:

```javascript
import { app, h } from 'hyperapp';
import debug from 'hyperapp-debug';
```

You can also grab it from [unpkg](https://unpkg.com/hyperapp-debug) in your HTML file:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/hyperapp"></script>
  <script src="https://unpkg.com/hyperapp-debug"></script><!-- exposed as `window['hyperapp-debug'].default`
</head>
</html>
```

## Usage

By wrapping hyperapp's `app`, the debug app gets mounted and wired into your app code.

```javascript
import { app, h } from 'hyperapp';
import debug from 'hyperapp-debug';
import { state, actions, view } from './your-app.js';

debug(app)(state, actions, view);
```

## Caveats

 1. As part of wrapping the app function, hyperapp-debug injects `$debugSetState` into your actions object to forcefully set the state of your app.
 2. `debug(app)` should probably not be used in production, since it will allow users to inspect your state, it may expose information you don't want exposed.

## License

hyperapp-debug is MIT licensed. See [LICENSE.md](./LICENSE.md).
