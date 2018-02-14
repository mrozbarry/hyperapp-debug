const path = require('path');
const lodashPlugin = require('lodash-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', 'index.js'),

  output: {
    path: path.resolve(__dirname, '..'),
    filename: 'index.js',
  },

  externals: {
    hyperapp: 'hyperapp',
  },

  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },

  plugins: [
    new lodashPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ],
}
