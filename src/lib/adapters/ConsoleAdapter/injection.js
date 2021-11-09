import { Console } from './console.js';
import { helpTopics } from './helpTopics.js';

export const injectGlobalDebug = () => {
  if (window.$hyperappDebug) return;

  const defaultLog = (leading = 'Hyperapp Debug', summary = undefined) => {
    return new Console()
      .style(`%c[%c${leading}%c]`, 'color:#999', 'color:red', 'color:#999')
      .append(summary)
  };

  const log = (leading, ...output) => {
    return defaultLog(leading)
      .append(...output)
      .log();
  };

  const registered = {}

  window.$hyperappDebug = {
    setApp: (debugIdOrNode) => {
      const adapter = (
        registered[debugIdOrNode]
        || Object.values(registered).find(a => a.node === debugIdOrNode)
      )
      if (!adapter) return;

      $hyperappDebug.$ = adapter;
      log('Hyperapp Debug', `Default debugging app set to "${adapter.id}"`, adapter.appProps.node, ', access with $hyperappDebug.$.<fn>');
      return adapter;
    },
    apps: () => Object.values(registered).map(app => app.adapter),
    help: (search) => {
      const logHelp = (ht) => {
        return defaultLog(ht.topic, ht.summary)
          .groupCollapsed(() => {
            ht.data.forEach(line => console.log(line));
            return helpTopics
              .filter(cht => cht.parent === ht.id)
              .forEach(logHelp);
          });
      };
      const roots = search
        ? helpTopics.filter(ht => ht.data.length > 0 && (
          ht.topic.includes(search) 
          || ht.summary.includes(search)
          || ht.data.join(' ').includes(search)
        ))
        : helpTopics.filter(ht => ht.parent === null);

      defaultLog('Hyperapp Debug Help', search ? `Results for "${search}"` : 'Expand for details')
        .groupCollapsed(() => roots.forEach(logHelp));
    },
    app: (id) => registered[id],
    register: (adapter) => {
      registered[adapter.id] = adapter;
      adapter.default = () => window.$hyperappDebug.setApp(adapter.id);
      adapter.$logging = {
        action: true,
        state: false,
        effects: true,
        subscriptions: true,
      };
      adapter.logging = (options) => {
        if (options) {
          if (typeof options === 'string') {
            const trimmed = options.replace(/^\!/, '');
            adapter.$logging[trimmed] = option === trimmed;
          } else if (Object(options) === options) {
            adapter.$logging = {
              ...adapter.$logging,
              ...options,
            };
          }
        }
        return { ...adapter.$logging };
      };

      log('Hyperapp Debug', `Debugging app ${adapter.id} at`, adapter.appProps.node);
      if (!window.$hyperappDebug.$) {
        window.$hyperappDebug.setApp(adapter.id);
      }
    },
  };

  log('Hyperapp Debug', 'Using ConsoleAdapter');
  window.$hyperappDebug.help();
};

