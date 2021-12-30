# VUE_DESIGN_READ

读霍春阳大佬vue-design文章有感，实现一个mini vue

[DEMO在线访问](https://hello-astar.asia/vue)

# To-Do-List
- [x] 转换为虚拟DOM + 各个版本的Diff算法
- [x] 数据改变 -> 视图改变 (模板解析、数据劫持等)
- [x] 视图改变 -> 数据改变 (事件监听、指令等)
- [ ] 生命周期钩子
- [x] 实现computed、methods
- [x] 实现v-for

[vue-design](http://hcysun.me/vue-design/zh/)

# 测试代码，运行项目
## 安装依赖
```
npm install
```
## 运行项目
```
npm run start
```

# 打包使用
```
npm run build
```
获取`/dist/index.js`文件，在你的`index.html`中引入该js文件即可使用Vue