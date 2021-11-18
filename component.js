/*
 * @Author: astar
 * @Date: 2021-05-27 16:37:32
 * @LastEditors: astar
 * @LastEditTime: 2021-11-18 13:34:38
 * @Description: 组件是输出vnode的函数
 * @FilePath: \vue\component.js
*/
import { h } from './packages/h.js'

// 函数式组件
export function Child (props) {
  let children = []
  for (let i = 0; i < props.msg.length; i++) {
    children.push(h('li', { key: props.msg[i] }, props.msg[i]))
  }
  return h('ul', null, children)
}

// 有状态组件
export class Parent {
  render () {
    let props = this.$props
    return h('div', null, [h('span', null, 'diff结果示例'), h(Child, props, null)])
  }
}

// 有状态组件
export const compA = {
  name: 'comp-a',
  data () {
    return {
      a: 100
    }
  },
  props: {
    message: {
      type: 'string'
    }
  },
  computed: {
    b: function () {
      return this.a + 100
    }
  },
  methods: {
    add () {
      this.message = 6666
    }
  },
  template: `<div>
    组件内数据{{a}}<br/>
    组件内computed: a + 100 = {{b}}<br/>
    传过来的组件props message = {{message}}
    <button v-on:click="add">修改props</button>
  </div>`
}