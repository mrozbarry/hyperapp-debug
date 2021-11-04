import { ConsoleAdapter } from './adapters/ConsoleAdapter.js';

export const debuggable = (originalApp) => ({ debugAdapter, debugId, ...props }) => {
  const adapter = debugAdapter || new ConsoleAdapter({
    id: debugId,
    subscriptions: props.subscriptions,
  });

  return originalApp({
    ...props,
    subscriptions: adapter.subscriptions,
    dispatch: adapter.dispatch,
  });
};
