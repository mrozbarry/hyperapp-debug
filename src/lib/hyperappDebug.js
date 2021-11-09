import { ConsoleAdapter } from './adapters/ConsoleAdapter/index.js';

export const debuggable = (originalApp) => (props) => {
  const adapter =  props.debug.adapter
    ? props.debug.adapter(props)
    : new ConsoleAdapter(props);

  return originalApp({
    ...props,
    subscriptions: adapter.subscriptionsOverride(),
    dispatch: adapter.dispatchOverride(),
  });
};
