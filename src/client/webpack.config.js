const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/client/client.ts',

  resolve: {
    // Allow absolute path resolution
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
    // Pick up typescript files
    extensions: ['.ts', '.tsx']
  },

  output: {
    // Output client.js here
    path: path.resolve('./dist/client'),
    filename: 'client.js'
  },

  module: {
    rules: [
      // Handle typescript files with typescript loader
      { test: /\.tsx?$/, loader: "ts-loader" }
    ],
  },

  plugins: [
    // Copy some static files as well in the build
    new CopyWebpackPlugin([
      { from: './src/client/index.html', to: path.resolve('./dist/client/') },
    ]),
  ],
};
