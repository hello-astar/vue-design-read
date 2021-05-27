/*
 * @Author: astar
 * @Date: 2021-05-26 19:57:19
 * @LastEditors: astar
 * @LastEditTime: 2021-05-27 15:05:33
 * @Description: 文件描述
 * @FilePath: \vue\test.js
 */
import { render } from './packages/render.js'
import { h } from './packages/h.js'

let template = `<div>{{test}}</div>`

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
    // 目前只能解析一行。。
    compile (el) {
      // let reg = /\{\{(.*)\}\}/ // 简单匹配{{test}}式子，获取绑定的data
      let tagNameReg = /^\<(.*)\>\{\{(.*)\}\}\<\/(.*)\>/ // 简单匹配tagname
      if (tagNameReg.test(template)) {
        const _this = this
        let key = RegExp.$2
        let tagName = RegExp.$1
        activeUpdate = function () {
        if (key in _this) {
            render(h(tagName, null, _this[key]), el)
          }
        }
        activeUpdate()
        activeUpdate = null
      }
      // console.log(tagNameReg.test(template))
      // let children = el.childNodes
      // if (!children.length) return
      // for (let i = 0; i < children.length; i++) {
      //   let child = children[i]
      //   let nodeType = child.nodeType
      //   if (nodeType === 3 && child.textContent) { // 普通文本
      //     if (reg.test(child.textContent)) {
      //       const _this = this
      //       let key = RegExp.$1
      //       activeUpdate = function () {
      //         if (key in _this) {
      //           console.log(el)
      //           const vnode = h(null, null, _this[key])
      //           console.log(vnode)
      //           render(vnode, el)
      //           // child.textContent = _this[key]
      //         }
      //       }
      //       activeUpdate()
      //       activeUpdate = null
      //     }
      //   } else {
      //     // render(h(child.tagName.toLowerCase()))
      //     this.compile(child)
      //   }
      // }
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

  let mvvm = new MVVM({
    el: '#app',
    data: function () {
      return {
        test: 'hahah',
        hello: '??'
      }
    }
  })
  setTimeout(() => {
    mvvm.test = 'jjjj'
  }, 1000)