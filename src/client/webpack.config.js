const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/client/ts/client.ts',

  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV == 'development' ? 'eval-source-map': '',

  resolve: {
    // Allow absolute path resolution
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
    // Pick up typescript files
    extensions: ['.js', '.ts']
  },

  output: {
    // Output client.js here
    path: path.resolve('./dist/client'),
    filename: 'client.js'
  },

  module: {
    rules: [
      // Handle typescript files with typescript loader
      {
        test: /\.ts$/,
        loader: "ts-loader",
      }
    ],
  },

  plugins: [
    // Copy some static files as well in the build
    new CopyWebpackPlugin([
      { from: './src/client/*.html', to: path.resolve('./dist/client/'), flatten:true },
      { from: './src/client/css', to: path.resolve('./dist/client/css') },
      { from: './version.json', to: path.resolve('./dist/client/')}
    ]),
  ],
};
