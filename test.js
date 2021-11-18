/*
 * @Author: astar
 * @Date: 2021-05-26 19:57:19
 * @LastEditors: astar
 * @LastEditTime: 2021-11-18 13:43:42
 * @Description: 测试环境入口文件
 * @FilePath: \vue\test.js
 */
import Vue from './packages/Vue.js'

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