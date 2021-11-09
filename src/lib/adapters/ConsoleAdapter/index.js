import { BaseAdapter } from '../BaseAdapter.js';
import { injectGlobalDebug } from './injection.js';

export class ConsoleAdapter extends BaseAdapter {
  constructor(props) {
    super(props);
  }

  log(type) {
    return window.$hyperappDebug.app(this.id) && $hyperappDebug.app(this.id).$logging[type]
      ? ((...data) => console.info(`"${this.id}"`, '|', type, ...data))
      : (() => {})
  }

  init() {
    injectGlobalDebug();
    window.$hyperappDebug.register(this);
  }

  onWarning(...warning) {
    warning.forEach(w => console.warn(w));
    this.pause();
  }

  onAction(actionFn, props, id) {
    this.log('action')(`"${id}"`, actionFn.name || '$AnonymousAction', props);
  }

  onState(state) {
    this.log('state')(state);
  }

  onEffect(effectFn, props) {
    this.log('effect')(effectFn.name || '$AnonymousEffect', props);
  }

  onSubscriptions(_subscriptions, { started, stopped }) {
    if (stopped.length) this.log('subscriptions')('stopped', stopped);
    if (started.length) this.log('subscriptions')('started', started);
  }
};

ConsoleAdapter.use = (props) => new ConsoleAdapter(props);
