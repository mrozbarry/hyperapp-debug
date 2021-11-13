export default [
  {
    input: 'src/lib/index.js',
    output: [
      {
        file: 'hyperapp-debug.umd.js',
        name: 'hyperappDebug',
        format: 'umd'
      },
      {
        file: 'hyperapp-debug.js',
        format: 'es'
      }
    ],
  },
];
