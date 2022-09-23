"use strict";

const CopyWebpackPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");
const glob = require("glob");

module.exports = (env, argv) => {
  const entry = {};
  for (const file of glob.sync("./src/*.js")) {
    entry[file.replace("./src/", "").replace(/\.js$/, "")] = file;
  }

  const config = {
    entry: entry,
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].js",
      pathinfo: true,
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {from: "./src/webext"},
          {from: "README.md"},
          {from: "LICENSE.md"},
        ],
      }),
      new ESLintPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          type: "javascript/esm",
        },
      ],
    },
    optimization: {},
  };

  if (argv.mode === "production") {
    config.optimization.minimize = false;
  }

  if (argv.mode === "development") {
    config.devtool = "inline-source-map";
  }

  return config;
};
