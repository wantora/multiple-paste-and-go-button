/* eslint-env node */
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    "background": "./src/background.js",
    "options": "./src/options.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    pathinfo: true,
  },
  devtool: "inline-source-map",
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new CopyWebpackPlugin([
      {
        from: "./src/webext",
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "eslint-loader",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
};
