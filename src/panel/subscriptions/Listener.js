const ListenerSub = (dispatch, {
  rootElement,
  eventName,
  onAction,
  onEffect,
  onSubscriptions,
}) => {
  const handleEvent = (event) => {
    const { detail: { type, timestamp, ...props } } = event;
    switch (type) {
      case 'action':
        return dispatch(onAction, props);

      case 'effect':
        return dispatch(onEffect, props);

      case 'subscriptions':
        return dispatch(onSubscriptions, props);
    }
  };

  rootElement.addEventListener(eventName, handleEvent);

  return () => {
    rootElement.removeEventListener(eventName);
  };
};

export const Listener = props => [ListenerSub, props];
