const makeId = () => Math.random().toString(36).slice(2);

const serializeJson = props => JSON.stringify(
  props,
  (_key, value) => (
    typeof value === 'function'
      ? `<function ${value.name || '__anonymous__'}() {}>`
      : value
  )
);

export class DevToolBridge {
  constructor(debugName, options = {}) {
    this.debugName = debugName;
    this.options = {
      CustomEvent: options.CustomEvent || window.CustomEvent,
      target: options.target || window,
    };
  }

  onMessage(onMessageFn) {
    const fn = (event) => {
      onMessageFn(
        JSON.parse(event.detail),
        event,
      );
    };
    const eventName = `$hyperapp-debug:${this.debugName}`;
    this.target.addEventListener(eventName, fn);

    return () => {
      this.target.removeEventListener(eventName, fn);
    };
  }

  emit(type, record, target = 'devtool') {
    this.options.target.dispatchEvent(
      new this.options.CustomEvent('$hyperapp-debug:extension', {
        detail: {
          ...record,
          type,
          source: this.debugName,
          target,
          timestamp: Date.now(),
        },
      }),
    );
  }

  subscription([effect, props], type, state) {
    const record = {
      id: `Subscription#${makeId()}`,
      label: `${effect.name}(${serializeJson(props)})`,
      state: serializeJson(state),
    };
    this.emit(type, record);
    return record;
  }

  action(action, props, state) {
    const record = {
      id: `Action#${makeId()}`,
      label: `${action.name}(${serializeJson(props)})`,
      state: serializeJson(state),
    };
    this.emit('action', record);
    return record;
  }

  effect([effect, props], state) {
    const record = {
      id: `Effect#${makeId()}`,
      label: `${effect.name}(${serializeJson(props)})`,
      state: serializeJson(state),
    };
    this.emit('effect', record);
    return record
  }
}
