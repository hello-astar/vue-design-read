/*
 * @Author: astar
 * @Date: 2021-05-19 18:22:30
 * @LastEditors: astar
 * @LastEditTime: 2021-05-26 20:18:53
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
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement',
      filename: 'index.html',
      template: 'index.html'
    }),
  ]
}