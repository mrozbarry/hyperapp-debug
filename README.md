# Hyperapp Debug

A debugger for hyperapp development.


## Get it

```bash
yarn add hyperapp-debug
```

## Use it:

```javascript
import { app, h } from 'hyperapp';
import debug from 'hyperapp-debug';

import { initialState, actions, view } from './yourApp.js';

export default debug(app)(initialState, actions, view, document.body);
```

You probably won't want to use this in a production environment.

## Check out the demo app

```bash
yarn start
```

[localhost:1234](http://localhost:1234)
