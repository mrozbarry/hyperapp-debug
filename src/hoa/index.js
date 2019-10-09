import * as subscriptionHelper from './helpers/subscription';
import { flattenEffects } from './helpers/flattenEffects';
import { raw } from './effects/messageDevTool';
import listener from './helpers/listener';
import * as dispatchHelper from './helpers/dispatch';

const APP_TO_DEVTOOL = '$hyperapp-app-to-devtool';
const APP_TO_PANEL = '$hyperapp-app-to-panel';
const DEVTOOL_TO_APP = '$hyperapp-devtool-to-app';

const randId = () => Math.random().toString(36).slice(2);

export default app => (props) => {
  let dispatch = null;
  const appId = randId();
  const appName = props.debugName || appId;

  const emitDevtoolMessage = (type, message = {}) => {
    raw(APP_TO_DEVTOOL, type, message);
  };

  const emitPanelMessage = (type, message = {}) => {
    raw(APP_TO_PANEL, type, message);
  };

  emitPanelMessage('query');
  emitDevtoolMessage('init');

  let dispatchHistory = {};
  const middleware = originalDispatch => {
    dispatch = originalDispatch;

    return (action, props) => {
      const id = [
        performance.now(),
        appId,
        randId(),
      ].join('_');

      dispatchHistory[id] = { action, props };

      const serialized = {
        ...dispatchHelper.serialize(action, props),
        appId,
        id
      };

      return emitDevtoolMessage('dispatch', serialized);
    };
  };

  const onDevToolDispatch = (message) => {
    if (message.appId !== appId) {
      return;
    }

    const item = dispatchHistory[message.payload.id];
    return item
      ? dispatch(item.action, item.props)
      : null;
  };

  const onDevToolShown = () => {
    emitDevtoolMessage('register', {
      appId,
      appName,
    });
  };

  const devToolMessageHandler = {
    'dispatch': onDevToolDispatch,
    'panel-shown': onDevToolShown,
  };

  const cancelDevToolListener = listener(DEVTOOL_TO_APP, (event) => {
    const message = JSON.parse(event.detail);
    const handler = devToolMessageHandler[message.type];
    if (!handler) {
      console.warn('no handler for', message.type, message);
    }
    handler(message);
  });

  const subscriptions = subscriptionHelper.wrap(props.subscriptions, (subEvents) => {
    emitDevtoolMessage('subscriptions', subEvents);
  });

  const appSignature = {
    ...props,
    subscriptions,
    middleware,
  };

  app(appSignature);
  return () => {
    cancelDevToolListener();
  };
};
