/*
 * @Author: astar
 * @Date: 2021-05-19 15:23:32
 * @LastEditors: astar
 * @LastEditTime: 2021-05-19 18:48:11
 * @Description: 文件描述
 * @FilePath: \vue\index.js
 */
import { render } from './packages/render.js'
import { h } from './packages/createVNode.js'
import { Fragment } from './config/consts.js'



export function test () {
    const dynamicClass1 = { 'a': true, 'b': false }
    const dynamicClass2 = [ 'c', 'd' ]
    const vnode = h('div', { style: { color: 'red' }, class: ['test', dynamicClass1], onClick: function () { console.log('click me') } }, [h('div', null, [h('span', null, 'kkk'), h(Fragment, null, null)])])
    console.log(document.getElementById('app'))
    render(vnode, document.getElementById('app'))
    
    setTimeout(() => {
        render(h('div', { class: ['test', dynamicClass2] }, h('span', null, '呵呵')), document.getElementById('app'))
    }, 1000)
}