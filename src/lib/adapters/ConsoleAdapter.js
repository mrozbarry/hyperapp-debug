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
    setApp: (debugIdOrNode) => {
      let { adapter } = $hyperappDebug.app.list[debugIdOrNode];
      if (!adapter) {
        const app = Object.values($hyperappDebug.app.list).find(a => a.adapter.node === debugIdOrNode);
        if (app) {
          adapter = app.adapter;
        }
      }
      if (!adapter) return;

      $hyperappDebug.$ = adapter;
      log('Hyperapp Debug', `Default debugging app set to "${adapter.id}"`, adapter.appProps.node, ', access with $hyperappDebug.$.<fn>');
    },
    list: () => {
      Object.values($hyperappDebug.app.list).forEach((app) => {
        log('Hyperapp Debug | Apps', `"${app.adapter.id}"`, app.adapter.appProps.node);
      });

      return Object.values($hyperappDebug.app.list).map(app => app.adapter);
    },
    help: () => {
      console.groupCollapsed(...logLeadFormatting('Hyperapp Debug'), 'Expand for some helpful console commands');

      helpLog(
        '<debugger>.setApp(debugId)', 'set the default adapter to debug',
        'Resets the state of the application to what it was after the specified action',
        'With the global object and debug id, $hyperappDebug.setApp("your debug id")',
        'With the global object and app root node, $hyperappDebug.setApp(document.querySelector("#id"))',
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
        'With the default application, $hyperappDebug.$.resume()',
        'With a specific application, $hyperappDebug.app.list[<app id>].resume()',
      );
      helpLog(
        '<adapter>.back(count = 1)', 'time travel backwards',
        'Go back to the previous action, or <count> actions ago',
        'With the default application, $hyperappDebug.$.back()',
        'With a specific application, $hyperappDebug.app.list[<app id>].back()',
      );
      helpLog(
        '<adapter>.forward(count = 1)', 'time travel forwards',
        'Go forwards to the next action, or <count> actions in the future',
        'With the default application, $hyperappDebug.$.forward()',
        'With a specific application, $hyperappDebug.app.list[<app id>].forward()',
      );
      helpLog(
        '<adapter>.resumeFromHere()', 'create a new timeline, discarding actions from the future',
        'Resume the app, but discard any future actions that were stored',
        'Only useful if you have timetraveled the app backwards',
        'With the default application, $hyperappDebug.$.resumeFromHere()',
        'With a specific application, $hyperappDebug.app.list[<app id>].resumeFromHere()',
      );
      helpLog(
        '<adapter>.resumeFromEnd()', 'resume debugging the app from the latest action',
        'Resume the app from the end, even if you have time travelled',
        'Only useful if you have timetraveled the app backwards, but want to resume',
        'With the default application, $hyperappDebug.$.resumeFromEnd()',
        'With a specific application, $hyperappDebug.app.list[<app id>].resumeFromEnd()',
      );

      helpLog(
        '<debugger>.help()', 'get this help text',
        'Get documentation on how to use the console adapter',
        '$hyperappDebug.help()',
      );
      console.groupEnd();
    },
    app: {
      list: {},
      register: (adapter) => {
        const appLog = type => (...args) => {
          if (!$hyperappDebug.app.list[adapter.id].logging[type]) {
            console.log('skipping', type);
            return;
          }
          log(`DEBUG.${type}`, ...args);
        };
        adapter.setLog(appLog);

        window.$hyperappDebug.app.list[adapter.id] = {
          adapter,
          logging: {
            action: true,
            state: false,
            effects: true,
            subscriptions: true,
          },
        };
        log('Hyperapp Debug', `Debugging app ${adapter.id} at`, adapter.appProps.node);
        if (!$hyperappDebug.$) {
          $hyperappDebug.setApp(adapter.id);
        }
      },
    },
  };

  log('Hyperapp Debug', 'Using ConsoleAdapter');
  window.$hyperappDebug.help();
};

export class ConsoleAdapter extends BaseAdapter {
  constructor(props) {
    super(props);

    this.log = (type) => (...data) => (
      $hyperappDebug.app.list[this.id].logging[type]
        && console.info(this.id, '|', type, ...data)
    );
  }

  setLog(logFn) {
    this.log = logFn;
  }

  init() {
    injectGlobalDebug();
    $hyperappDebug.app.register(this);
  }

  onResume() {
  }

  onPause() {
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

  onSubscriptions(_subscriptions, { started, stopped }) {
    if (started.length) this.log('subscriptions')('started', started);
    if (stopped.length) this.log('subscriptions')('stopped', stopped);
  }
};
