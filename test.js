/*
 * @Author: astar
 * @Date: 2021-05-26 19:57:19
 * @LastEditors: astar
 * @LastEditTime: 2021-05-26 20:10:37
 * @Description: 文件描述
 * @FilePath: \vue\test.js
 */
import { render } from './packages/render.js'
import { h } from './packages/h.js'

let activeUpdate = null
  class MVVM {
    constructor (options) {
      this.$options = options || {}
      this._data = this.$options.data()
      this.$el = document.querySelector(options.el)
      // 数据劫持
      this.observe()
      this.compile(this.$el)
    }
    
    observe () {
      for (let key in this._data) {
        let dep = new Dep()
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: true,
          get: () => {
            dep.depend()
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
    compile (el) {
      let reg = /\{\{(.*)\}\}/
      let children = el.childNodes
      if (!children.length) return
      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        let nodeType = child.nodeType
        if (nodeType === 3 && child.textContent) { // 普通文本
          if (reg.test(child.textContent)) {
            const _this = this
            let key = RegExp.$1
            activeUpdate = function () {
              if (key in _this) {
                child.textContent = _this[key]
              }
            }
            activeUpdate()
            activeUpdate = null
          }
        } else {
          this.compile(child)
        }
      }
    }
  }

  class Dep {
    constructor () {
      this.subs = new Set()
    }

    depend () {
      if (activeUpdate) {
        this.subs.add(activeUpdate)
      }
    }

    notify () {
      this.subs.forEach(sub => sub())
    }
  }

  // let mvvm = new MVVM({
  //   el: '#app',
  //   data: function () {
  //     return {
  //       test: 'hahah',
  //       hello: '??'
  //     }
  //   }
  // })
  // setTimeout(() => {
  //   mvvm.test = 'jjjj'
  // }, 1000)

  // 渲染页面
  // const { h, render } = Vue

  const vnode = h('div', null, [h('span', null, '哈哈哈'), h('div', null, 'kk')])
  render(vnode, document.getElementById('app'))

  console.log(document.getElementById('app').vnode)

  setTimeout(() => {
      render(h('div', { class: ['test'] }, h('span', null, '呵呵')), document.getElementById('app'))
  }, 1000)