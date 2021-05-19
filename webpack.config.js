/*
 * @Author: astar
 * @Date: 2021-05-19 18:22:30
 * @LastEditors: astar
 * @LastEditTime: 2021-05-19 18:48:40
 * @Description: 文件描述
 * @FilePath: \vue\webpack.config.js
 */
module.exports = {
  entry: './index.js',
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'Vue'
  }
}