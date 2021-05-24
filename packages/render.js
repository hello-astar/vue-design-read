/*
 * @Author: astar
 * @Date: 2021-05-19 15:25:03
 * @LastEditors: astar
 * @LastEditTime: 2021-05-24 18:01:42
 * @Description: 文件描述
 * @FilePath: \vue\packages\render.js
 */
import { VNodeFlags } from '../config/consts.js'
import mount from './mount.js'
import patch from './patch.js'



// 判断mount还是patch
export const render = function (vnode, container) {
  const prevVNode = container.vnode
  if (!prevVNode) {
    if (vnode) {
      const isSVG = vnode.flag & VNodeFlags.ELEMENT_SVG
      mount(vnode, container, isSVG)
      container.vnode = vnode
    }
  } else {
    if (vnode) {
      patch(prevVNode, vnode, container)
      container.vnode = vnode
    } else {
      container.removeChild(prevVNode.el)
      container.vnode = null
    }
  }
}