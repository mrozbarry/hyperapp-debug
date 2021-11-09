# Hyperapp Debug Adapters

Adapters are a way to connect the functionality of your application to the debugger.

## Configuring

All debugger adapters support adding a new object to your application props, `debug`.
Here's an example:

```javascript
import { app } from 'hyperapp';
import { debuggable, adapters } from 'hyperapp-debug';

debuggable(app)({
  init: INITIAL_STATE,
  view: yourViewFn(),
  node: document.querySelector('#app'),

  debug: {
    id: 'foo',
    adapter: adapters.ConsoleAdapter.use,
  },
});
```

## Built-In Adapters

### ConsoleAdapter

The console adapter creates a debug API directly in your browser's console developer tool.
The cool thing about this is you can interact with you application's state and data using regular old javascript, no extra tooling on top.

### PopupAdapter

## Building Your Own Adapters
