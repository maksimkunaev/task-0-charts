const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  module: {
    rules: [
      { test: /\.ts?$/, loader: "ts-loader", exclude: /node_modules/, },
      { test: /\.js?$/, loader: "ts-loader", exclude: /node_modules/, },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, 'src/css'), to: path.join(__dirname, 'dist/css') },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
  ],
};