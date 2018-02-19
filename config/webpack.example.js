const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-eval-source-map',

  entry: path.resolve(__dirname, '..', 'example', 'App.js'),

  output: {
    filename: 'bundle.js',
    publicPath: '/',
    path: path.resolve(__dirname),
  },

  module: {
    rules: [
      { test: /\.styl/, use: ['style-loader', 'css-loader', 'stylus-loader'] },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  target: 'web',

  devServer: {
    port: 8080,
    host: '0.0.0.0',
    contentBase: path.resolve(__dirname, '..', 'example'),
    hot: true,
  },
};
