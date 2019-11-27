const path = require("path")
const webpack = require("webpack")

const CopyWebpackPlugin = require("copy-webpack-plugin")

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development"

module.exports = {
  entry: "./src/client/main.ts",

  mode: env,
  devtool: env == "development" ? "eval-source-map": "",

  resolve: {
    // Allow absolute path resolution
    modules: [
      path.resolve("./node_modules")
    ],
    // Pick up typescript files
    extensions: [".js", ".ts"]
  },

  output: {
    // Output client.js here
    path: path.resolve("./dist/client"),
    filename: "client.js"
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
      { from: "./src/client/*.html", to: path.resolve("./dist/client/"), flatten:true },
    ]),
  ],

  devServer: {
    contentBase: path.join("./dist"),
    compress: true,
    port: 9000
  }
};