/*
 * @Author: astar
 * @Date: 2021-05-27 16:37:32
 * @LastEditors: astar
 * @LastEditTime: 2021-05-27 23:39:22
 * @Description: 文件描述
 * @FilePath: \vue\component.js
*/
import { h } from './packages/h.js'

export function Child (props) {
  let children = []
  for (let i = 0; i < props.msg.length; i++) {
    children.push(h('li', { key: props.msg[i] }, props.msg[i]))
  }
  return h('ul', null, children)
}

export function Parent (props) {
  return h(Child, { msg: props.msg }, null)
}

// class Child {
//   render () {
//     return h('div', null, this.$props.msg)
//   }
// }
// class Parent {
//   render () {
//     return h(Child, { msg: this.$props.msg }, null)
//   }
// }