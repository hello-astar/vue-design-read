/*
 * @Author: astar
 * @Date: 2021-05-26 19:57:19
 * @LastEditors: astar
 * @LastEditTime: 2021-12-10 03:14:38
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
      d: 5,
      e: ['a', 'b', 'c', 'd', 'f', 'e'],
      input: 'hello',
      style: {
        color: 'red'
      },
      show: false
    }
  },
  // beforeCreate () {
  //   console.log('parent beforeCreate')
  // },
  // created () {
  //   // 钩子函数开始啦
  //   console.log('parent created')
  // },
  // beforeMount () {
  //   console.log('parent beforeMount')
  // },
  // mounted () {
  //   console.log('parent mounted')
  // },
  // beforeUpdate () {
  //   console.log('parent beforeUpdate')
  // },
  // updated () {
  //   console.log('parent updated')
  // },
  // beforeDestroy () {
  //   console.log('parent beforeDestroy')
  // },
  // destroyed () {
  //   console.log('parent destroyed')
  // },
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
    <li>
      5. 数据修改 --》 视图修改
      <p>计时器倒计时{{d}}s</p>
    </li>
    <li>
      6. 利用v-for展示diff操作，打开控制台可看到
      修改数组['a', 'b', 'c', 'd', 'f', 'e'] =》 ['a', 'c', 'd', 'b', 'g', 'e']
      <div v-for="(item, idx) in e" :key="item">
        <span :style="style">{{idx}} - {{item}}</span>
      </div>
    </li>
  </ul>`
})
let timer1 = null
function count () {
  timer1 = setTimeout(function () {
    timer1 && clearTimeout(timer1)
    --mvvm.d && count()
  }, 1000)
}
count()

let timer2 = setTimeout(() => {
  mvvm.e = ['a', 'c', 'd', 'b', 'g', 'e']
  timer2 && clearTimeout(timer2)
}, 1000);
