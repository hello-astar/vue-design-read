/*
 * @Author: astar
 * @Date: 2021-05-19 18:14:57
 * @LastEditors: astar
 * @LastEditTime: 2021-05-24 14:30:57
 * @Description: 文件描述
 * @FilePath: \vue\packages\createVNode.js
 */
import { VNodeFlags, ChildrenFlags, Fragment, Portal } from '../config/consts.js'

const normalizeVNodes = function (children) {
  const newChildren = []
  // 遍历 children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.key == null) {
      // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
      child.key = '|' + i
    }
    newChildren.push(child)
  }
  // 返回新的children，此时 children 的类型就是 ChildrenFlags.KEYED_VNODES
  return newChildren
}

export const createTextVNode = function (text) {
  return {
    _isVNode: true,
    tag: null,
    data: null,
    children: text,
    flags: VNodeFlags.TEXT,
    childFlags: ChildrenFlags.SINGLE_VNODE,
    el: null
  }
}

export const h = function (tag, data, children) {
  let flags = null
  if (typeof tag === 'string') {
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML
  } else if (tag === Fragment) {
    flags = VNodeFlags.FRAGMENT
  } else if (tag === Portal) {
    flags === VNodeFlags.Portal
    tag = data && data.target
  } else {
    if (tag !== null && typeof tag === 'object') { // vue2
      flags = tag.functional
      ? VNodeFlags.COMPONENT_FUNCTIONAL
      : VNodeFlags.COMPONENT_STATEFUL_NORMAL
    } else if (typeof tag === 'function') { // vue3
      flags = tag.prototype && tag.prototype.render
      ? VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
      : VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
    }
  }

  let childFlags = null
  if (Array.isArray(children)) {
    const { length } = children
    if (length === 0) {
        childFlags = ChildrenFlags.NO_CHILDREN
    } else if (length === 1) {
        childFlags = ChildrenFlags.SINGLE_VNODE
        children = children[0]
    } else {
        childFlags = ChildrenFlags.KEYED_VNODES
        children = normalizeVNodes(children) // 生成key
    }
  } else if (children === null) {
      childFlags = ChildrenFlags.NO_CHILDREN
  } else if (children._isVNode) {
      childFlags = ChildrenFlags.SINGLE_VNODE
  } else {
      // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
      childFlags = ChildrenFlags.SINGLE_VNODE
      children = createTextVNode(children + '')
  }
  return {
    _isVNode: true,
    el: null,
    flags,
    childFlags,
    tag,
    data,
    children
  }
}