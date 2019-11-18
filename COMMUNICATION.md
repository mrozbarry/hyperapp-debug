# Diagrams

## Security Layers

 - Web Application (No access to anything beyond it's page)
 - Content Script
    - with limited access to window
    - can send/receive dom events
      - limited to only serializable data
        - can't pass: functions, objects, or anything else with references
        - must be a primitive (like json object stringified)
    - can access devtool runtime ports
    - can inject function reference to page, *but* only on Firefox
      - can't use this :(
 - Devtool Level (devtool runtime ports)


## Message

Messages are (mostly) serialized from dispatch calls, which take the form of `(action, props)`

```js
{
  type: 'dispatch',
  appId: string,
  payload: {
    action: state|function|[function, object]
    props:  undefined|object|decoder?
  }
}
```


### Communication from hyperapp to panel

 1. Event emitter in the withDebug higher-order app function
    - message devtool (devtool panel app)
    - message panel (devtool panel controller)
 2. Content script
    1. Event listener waiting for messages from the app
    2. Chrome devtool runtime port to message background script
 3. Background script (message router)
    1. Accepts connection from content script (at page load)
    2. Checks to see if there is an available port that matches the `target` in the message


