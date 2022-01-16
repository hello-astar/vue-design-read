/*
 * @Author: astar
 * @Date: 2021-05-19 18:22:30
 * @LastEditors: astar
 * @LastEditTime: 2022-01-16 18:29:55
 * @Description: 文件描述
 * @FilePath: \vue\webpack.config.js
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)


module.exports = {
  entry: process.env.NODE_ENV === 'development' ? './test.js' : './index.js',
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'Vue'
  },
  devtool: 'source-map',
  optimization: {
      minimize: false
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
    port: 1992
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },  
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
  ],
  resolve: {
    // 设置别名
    alias: {
      '@': resolve('./')
    }
  }
}