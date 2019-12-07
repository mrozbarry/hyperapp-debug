import { browserTest } from '../../support/jsdom';
import sinon from 'sinon';
import devtool from './devtool';

const appId = 'appId';
const appName = 'appName';

browserTest('makes a bridge with emit, listen, and close', (t) => {
  const bridge = devtool(appId, appName);

  t.is(typeof bridge.emit, 'function');
  t.is(typeof bridge.listen, 'function');
  t.is(typeof bridge.close, 'function');

  bridge.close();
});

browserTest('it emits register with appname to panel', (t) => {
  const idGenerator = (id, type) => `${id}_${type}`;
  const dispatchEventSpy = sinon.spy(window, 'dispatchEvent');

  const bridge = devtool(appId, appName, idGenerator);

  const expectedEventDetail = {
    id: `${appId}_register`,
    appId,
    target: 'panel',
    type: 'register',
    payload: { appName },
  };


  t.deepEqual(dispatchEventSpy.firstCall.args[0].detail, expectedEventDetail);

  window.dispatchEvent.restore();
  bridge.close();
});

browserTest('it can make a listener with a cleanup function', (t) => {
  const bridge = devtool(appId, appName);

  const listener = sinon.fake();
  const cancel = bridge.listen(listener);

  const detail = { target: 'app', appId };
  const event = new window.CustomEvent('$hyperapp-debugger', { detail });
  window.dispatchEvent(event);

  t.is(listener.callCount, 1);
  t.deepEqual(listener.firstCall.args[0], detail);

  cancel();
  bridge.close();
});

browserTest('the listener ignores messages not targetting the app', (t) => {
  const bridge = devtool(appId, appName);

  const listener = sinon.fake();
  const cancel = bridge.listen(listener);

  const detail = { target: 'foo', appId };
  const event = new window.CustomEvent('$hyperapp-debugger', { detail });
  window.dispatchEvent(event);

  t.is(listener.callCount, 0);

  cancel();
  bridge.close();
});

browserTest('the listener ignores messages targetting app with the wrong appId', (t) => {
  const bridge = devtool(appId, appName);

  const listener = sinon.fake();
  const cancel = bridge.listen(listener);

  const detail = { target: 'app', appId: `not${appId}` };
  const event = new window.CustomEvent('$hyperapp-debugger', { detail });
  window.dispatchEvent(event);

  t.is(listener.callCount, 0);

  cancel();
  bridge.close();
});

browserTest('the listener can parse JSON strings', (t) => {
  const bridge = devtool(appId, appName);

  const listener = sinon.fake();
  const cancel = bridge.listen(listener);

  const detail = { target: 'app', appId };
  const event = new window.CustomEvent('$hyperapp-debugger', { detail: JSON.stringify(detail) });
  window.dispatchEvent(event);

  t.is(listener.callCount, 1);
  t.deepEqual(listener.firstCall.args[0], detail);

  cancel();
  bridge.close();
});

browserTest('the default target is devtool', (t) => {
  const dispatchEventSpy = sinon.spy(window, 'dispatchEvent');

  const bridge = devtool(appId, appName);

  const listener = sinon.fake();
  const cancel = bridge.listen(listener);

  const id = bridge.emit('foo', {});

  const expectedDispatch = {
    type: 'foo',
    payload: {},
    target: 'devtool',
    id,
    appId,
  };

  t.deepEqual(dispatchEventSpy.lastCall.args[0].detail, expectedDispatch);

  cancel();
  bridge.close();
});
