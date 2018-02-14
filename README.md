# Hyperapp Debug

A debugger for hyperapp development.


## Get it

```bash
yarn add https://github.com/mrozbarry/hyperapp-debug.git
```

## Use it:

```javascript
import { app, h } from 'hyperapp';
import hyperappDebug from 'hyperapp-debug';

import { initialState, actions, view } from './yourApp.js';

// Or whatever...maybe you have index.development.js and index.production.js, and don't need this.
// In this case, use the debugger in development, otherwise don't
const USE_DEBUGGER = process.env.NODE_ENV === 'development';

const hyperApp = USE_DEBUGGER ? hyperappDebug : app;

export default hyperApp(initialState, actions, view, document.body);
```

## Check out the demo app

```bash
yarn start
```

[localhost:1234](http://localhost:1234)
