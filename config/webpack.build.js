const path = require('path');
const lodashPlugin = require('lodash-webpack-plugin');
const Uglify = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', 'index.js'),

  output: {
    path: path.resolve(__dirname, '..'),
    filename: 'index.js',
    library: 'hyperapp-debug',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },

  externals: {
    hyperapp: 'hyperapp',
  },

  plugins: [
    new Uglify(),
  ],
}
