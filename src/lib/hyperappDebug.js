import { ConsoleAdapter } from './adapters/ConsoleAdapter.js';

export const debuggable = (originalApp) => (props) => {
  const adapter =  new (props.debugAdapter || ConsoleAdapter)(props);

  return originalApp({
    ...props,
    subscriptions: adapter.subscriptions(props.subscriptions),
    dispatch: adapter.dispatch,
  });
};
