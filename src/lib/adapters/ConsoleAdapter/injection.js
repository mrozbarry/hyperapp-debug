import { Console } from "./console.js";
import { helpTopics } from "./helpTopics.js";

export const injectGlobalDebug = () => {
  if (window.$hyperappDebug) return window.$hyperappDebug;

  const defaultLog = (leading = "Hyperapp Debug", summary = undefined) => {
    return new Console()
      .style(`%c[%c${leading}%c]`, "color:#999", "color:red", "color:#999")
      .append(summary);
  };

  const log = (leading, ...output) => {
    return defaultLog(leading)
      .append(...output)
      .log();
  };

  const adapters = {};

  window.$hyperappDebug = {
    setApp: (debugIdOrNode) => {
      const adapter =
        adapters[debugIdOrNode] ||
        Object.values(adapters).find((a) => a.node === debugIdOrNode);
      if (!adapter) return;

      $hyperappDebug.$ = adapter;
      log(
        "Hyperapp Debug",
        `Default debugging app set to "${adapter.id}"`,
        adapter.appProps.node,
        ", access with $hyperappDebug.$.<fn>"
      );
      return adapter;
    },
    apps: () => Object.values(adapters),
    help: (search) => {
      const logHelp = (ht) => {
        return defaultLog(ht.topic, ht.summary).groupCollapsed(() => {
          ht.data.forEach((line) => console.log(line));
          return helpTopics
            .filter((cht) => cht.parent === ht.id)
            .forEach(logHelp);
        });
      };
      const searchRegexp = new RegExp(search, "ig");
      const roots = search
        ? helpTopics.filter(
            (ht) =>
              ht.data.length > 0 &&
              searchRegexp.test(
                `${ht.topic} ${ht.summary} ${ht.data.join(" ")}`
              )
          )
        : helpTopics.filter((ht) => ht.parent === null);

      defaultLog(
        "Hyperapp Debug Help",
        search ? `Results for "${search}"` : "Expand for details"
      ).groupCollapsed(() => roots.forEach(logHelp));
    },
    app: (name) => adapters[name],
    register: (name, adapter) => {
      adapters[name] = adapter;

      log("Hyperapp Debug", `Debugging app ${name}`);
      if (!window.$hyperappDebug.$) {
        window.$hyperappDebug.setApp(name);
      }
    },
  };

  log("Hyperapp Debug", "Using ConsoleAdapter");
  window.$hyperappDebug.help();
  return window.$hyperappDebug;
};
