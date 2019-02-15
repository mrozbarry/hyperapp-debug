const path = require('path');
const lodashPlugin = require('lodash-webpack-plugin');
const Uglify = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', 'index.js'),

  output: {
    path: path.resolve(__dirname, '..'),
    filename: 'bundle.js',
    library: 'withDebug',
    libraryExport: 'debug',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  module: {
    rules: [
      { test: /\.styl$/, use: ['style-loader', 'css-loader', 'stylus-loader'] },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },

  externals: {
    hyperapp: 'hyperapp',
  },

  optimization: {
    minimizer: [new Uglify()],
  },
}
