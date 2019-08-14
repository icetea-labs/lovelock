// require("dotenv").config();
// const path = require("path");
// const Dotenv = require("dotenv-webpack");
const { parsed: localEnv } = require("dotenv").config();
const withCSS = require("@zeit/next-css");
const webpack = require("webpack");

module.exports = withCSS({
  // webpack: config => {
  //   config.plugins = config.plugins || [];

  //   config.plugins = [
  //     ...config.plugins,

  //     // Read the .env file
  //     new Dotenv({
  //       path: path.join(__dirname, ".env"),
  //       systemvars: true
  //     })
  //   ];
  //   return config;
  // },
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv));

    return config;
  },
  cssModules: true
});
