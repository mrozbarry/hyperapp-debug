import { BaseAdapter } from './BaseAdapter';

const injectGlobalDebug = () => {
  if (window.$hyperappDebug) return;

  const logLeadFormatting = (leading) => [`%c[%c${leading}%c]`, 'color:black', 'color:red', 'color:black'];

  const log = (leading, ...output) => {
    console.log(...logLeadFormatting(leading), ...output);
  };

  const helpLog = (functionWithArgs, summary, ...description) => {
    if (description.length === 0) {
      console.log(...logLeadFormatting(`Hyperapp Debug Help | ${functionWithArgs}`), summary);
    }
    console.groupCollapsed(...logLeadFormatting(`Hyperapp Debug Help | ${functionWithArgs}`), summary);
    description.forEach(line => console.log(line));
    console.groupEnd();
  };

  window.$hyperappDebug = {
    setDefault: (debugId) => {
      const { adapter } = $hyperappDebug.app.list[debugId];
      if (!adapter) return;
      $hyperappDebug.$ = adapter;
      log('Hyperapp Debug', `Default debugging app set to ${debugId}, access with $hyperappDebug.$.<fn>`);
    },
    help: () => {
      console.groupCollapsed(...logLeadFormatting('Hyperapp Debug'), 'Expand for some helpful console commands');

      helpLog(
        '<debugger>.setDefault(debugId)', 'set the default adapter to debug',
        'Resets the state of the application to what it was after the specified action',
        'With the global object, $hyperappDebug.setDefault("your debug id")',
      );

      helpLog(
        '<adapter>.restoreFromAction(actionId)', 'timetravel state of default debug app',
        'Resets the state of the application to what it was after the specified action',
        'With the default application, $hyperappDebug.$.restoreFromAction("action id here")',
        'With a specific application, $hyperappDebug.app.list[<app id>].restoreFromAction("action id here")',
      );

      helpLog(
        '<adapter>.pause()', 'pause the application',
        'Prevent the application from any further actions, state updates, or running side-effects',
        'With the default application, $hyperappDebug.$.pause()',
        'With a specific application, $hyperappDebug.app.list[<app id>].pause()',
      );
      helpLog(
        '<adapter>.resume()', 'resume the application',
        'Allow the application to perform actions, state updates, and running side-effects',
        'With the default application, $hyperappDebug.$.play()',
        'With a specific application, $hyperappDebug.app.list[<app id>].play()',
      );

      helpLog(
        'help()', 'get this help text',
        'Get documentation on how to use the console adapter',
        '$hyperappDebug.help()',
      );
      console.groupEnd();
    },
    app: {
      list: {},
      register: (adapter) => {
        const appLog = type => (...args) => {
          if (!$hyperappDebug.app.list[adapter.id].logging[type]) return;
          log(`DEBUG.${type}`, ...args);
        };
        adapter.setLog(appLog);

        window.$hyperappDebug.app.list[adapter.id] = {
          adapter,
          logging: {
            actions: true,
            state: true,
            effects: true,
            subscriptions: true,
          },
        };
        log('Hyperapp Debug', `Debugging app ${adapter.id}`);
        if (!$hyperappDebug.defaultDebugId) {
          $hyperappDebug.setDefault(adapter.id);
        }
      },
    },
  };

  log('Hyperapp Debug', 'Using ConsoleAdapter');
  window.$hyperappDebug.help();
};

export class ConsoleAdapter extends BaseAdapter {
  constructor(...config) {
    super(...config);
    this.log = () => () => {};
  }

  setLog(logFn) {
    this.log = logFn;
  }

  init() {
    injectGlobalDebug();
    $hyperappDebug.app.register(this);
  }

  onAction(actionFn, props, id) {
    this.log('action')(`<id=${id}>`, actionFn.name || '$AnonymousAction', props);
  }

  onState(state) {
    this.log('state')(state);
  }

  onEffect(effectFn, props) {
    this.log('effect')(effectFn.name || '$AnonymousEffect', props);
  }

  onSubscriptions(subscriptions) {
    this.log('subscriptions')(subscriptions);
  }
};
