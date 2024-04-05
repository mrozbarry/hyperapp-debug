import * as BaseAdapter from "../BaseAdapter.js";
import { injectGlobalDebug } from "./injection.js";

export const make = (name) => {
  const adapter = BaseAdapter.make(name);
  adapter.on("log", console.log);
  adapter.on("info", console.info);
  adapter.on("warn", console.warn);
  adapter.on("error", console.error);

  const globalDebug = injectGlobalDebug();
  globalDebug.register(name, adapter);

  return adapter;
};
