export const make = (...newPrefixes) => {
  const prefixes = [].concat(newPrefixes);
  const logAs = method => (...data) => {
    console[method](...data);
  };
  const logger = logAs('log');

  logger.withContext = (...contexts) => {
    return make(prefixes.concat(contexts));
  };

  logger.error = logAs('error');

  logger.warn = logAs('warn');

  return logger;
};
