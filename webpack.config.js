/*
 * @Author: astar
 * @Date: 2021-05-19 18:22:30
 * @LastEditors: astar
 * @LastEditTime: 2021-05-27 15:41:00
 * @Description: 文件描述
 * @FilePath: \vue\webpack.config.js
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  entry: process.env.NODE_ENV === 'development' ? './test.js' : './index.js',
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'Vue'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve(__dirname, './loader/compile.js'),
            options: {
              key: 100
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement',
      filename: 'index.html',
      template: 'index.html'
    }),
  ]
}