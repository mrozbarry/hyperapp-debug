export const create = (adapter) => {
  const annotate = {
    log:
      (fn) =>
      (...args) => {
        adapter.trigger("log", fn, args);
        return fn(...args);
      },
  };

  return {
    annotate,
  };
};
