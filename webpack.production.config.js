/* eslint-env node */
const webpack = require("webpack");
const _ = require("lodash");

const config = _.cloneDeep(require("./webpack.config.js"));

config.devtool = false;

config.plugins = config.plugins.concat([
  new webpack.LoaderOptionsPlugin({
    debug: false,
  }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production"),
  }),
  new webpack.NoEmitOnErrorsPlugin(),
]);

module.exports = config;
