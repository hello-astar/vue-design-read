/*
 * @Author: astar
 * @Date: 2021-05-27 16:37:32
 * @LastEditors: astar
 * @LastEditTime: 2021-09-29 02:23:48
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
  // return h(Child, { msg: props.msg }, null)
  return h('div', props, props.msg)
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