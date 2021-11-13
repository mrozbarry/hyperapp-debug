import { ConsoleAdapter } from './adapters/ConsoleAdapter/index.js';

export const debuggable = (originalApp) => ({ debug, ...props }) => {
  if (debug && !debug.enable) {
    return originalApp(props);
  }

  const allProps = { ...props, debug };

  const adapter =  debug && debug.adapter
    ? debug.adapter(allProps)
    : new ConsoleAdapter(allProps);

  return originalApp({
    ...props,
    subscriptions: adapter.subscriptionsOverride(),
    dispatch: adapter.dispatchOverride(),
  });
};
