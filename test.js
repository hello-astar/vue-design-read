/*
 * @Author: astar
 * @Date: 2021-05-26 19:57:19
 * @LastEditors: astar
 * @LastEditTime: 2021-11-18 13:36:38
 * @Description: 文件描述
 * @FilePath: \vue\test.js
 */
import { render } from './packages/render.js'
import { h } from './packages/h.js'
import * as components from './component.js'
import Vue from './packages/Vue.js'

class MVVM {
  constructor (options) {
    this.$options = options || {}
    this._data = this.$options.data() // Object.defineProperty实现数据绑定需要有一个备份
    this._methods = this.$options.methods // 存储函数
    this.$el = document.querySelector(options.el)
    // 数据劫持
    this.observe()
    this.compile(this.$el)
  }

  /**
  * 监听所有属性
  * @author astar
  * @date 2021-10-01 16:51
  */
  observe() {
    for (let key in this._data) {
      let dep = new Dep()
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          Dep.target && dep.addSub(Dep.target)
          return this._data[key]
        },
        set: (val) => {
          this._data[key] = val
          dep.notify()
        }
      })
    }
  }

  // 解析DOM，生成VNODE
  // 目前只能解析一行。。
  compile(el) {
    // let reg = /\{\{(.*)\}\}/ // 简单匹配{{test}}式子，获取绑定的data
    let tagNameReg = /^\<(.*)\>\{\{(.*)\}\}\<\/(.*)\>/ // 简单匹配tagname
    if (tagNameReg.test(this.$options.template)) {
      const _this = this
      let key = RegExp.$2
      let tagName = RegExp.$3
      let watcher = new Watcher(function () {
        let vnode = h(components[tagName] || tagName, { msg: _this[key], onclick: _this.$options.methods.add.bind(_this) }, null)
        render(vnode, el)
      })
      watcher.update()
    }
  }
}

class Dep {
  constructor () {
    this.subs = new Set()
  }

  addSub (sub) {
    this.subs.add(sub)
  }

  notify () {
    this.subs.forEach(sub => sub.update())
  }
}

// 作为桥梁，实现双向数据绑定
class Watcher {
  constructor (func) {
    this.cb = func
    this.depIds = {}
  }

  get () {
    console.log('hhh')
  }
  // 数据更新 -> 页面更新
  update () {
    Dep.target = this
    this.cb()
    Dep.target = null
  }

  // 页面更新 -> 数据更新
  addDep (depIds) {
    this.deps.add(depIds)
  }
}


// 测试diff算法
let mvvm = new Vue({
  mountPlace: '#app',
  data: function () {
    return {
      a: 100,
      b: 1,
      input: 'hello',
      show: false
    }
  },
  created () {
    // 钩子函数开始啦
  },
  methods: {
    add () {
      this.a++
    },
    changeShow () {
      this.show = !this.show
    }
  },
  computed: {
    c: function () {
      return this.a + this.b
    }
  },
  template: `
  <ul>
    <li>
      1. 文本渲染<br/>
      a = {{a}} b = {{b}}<br/>
      a + b = c：{{a}} + {{b}} = {{c}}<br/>
      <button v-on:click="add">a + 1</button>
    </li>
    <li>2. 指令测试v-show:
      <div v-show="show">{{input}}</div>
      <button v-on:click="changeShow">测试v-show</button><br/>
    </li>
    <li>
      3. 指令测试v-model<br/>
      <input type="text" v-model="input" />
    </li>
    <li>
      4. 组件测试
      <compA :message="input"></compA>
    </li>
  </ul>`
})