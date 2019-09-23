const streamArray = (streams, name) => streams[name] || [];

export default ({ streams }) => {
  return Math.max(
    streamArray(streams, 'actions').length,
    streamArray(streams, 'commit').length,
    streamArray(streams, 'effects').length,
    ...Object.values(streams.subscription).map(s => s.length),
  ) - 1;
};
