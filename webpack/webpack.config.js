const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const demoPath = path.resolve(__dirname, "../demo_dist");

module.exports = {
  mode: "development",
  entry: "./demo/index.ts",
  devtool: "inline-source-map",
  devServer: {
    contentBase: demoPath
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".mjs", ".ts", ".tsx", ".js"]
  },
  plugins: [
    // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Development"
    })
  ],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  output: {
    filename: "main.js",
    path: demoPath
  }
};
