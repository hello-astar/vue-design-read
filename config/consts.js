/*
 * @Author: astar
 * @Date: 2021-05-19 15:31:14
 * @LastEditors: astar
 * @LastEditTime: 2021-05-24 17:34:27
 * @Description: 文件描述
 * @FilePath: \vue\config\consts.js
 */
const VNODEFLAGS = {
  // html 标签
  ELEMENT_HTML: 1,
  // SVG 标签
  ELEMENT_SVG: 1 << 1,

  // 普通有状态组件
  COMPONENT_STATEFUL_NORMAL: 1 << 2,
  // 需要被keepAlive的有状态组件
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
  // 已经被keepAlive的有状态组件
  COMPONENT_STATEFUL_KEPT_ALIVE: 1 << 4,
  // 函数式组件
  COMPONENT_FUNCTIONAL: 1 << 5,

  // 纯文本
  TEXT: 1 << 6,
  // Fragment
  FRAGMENT: 1 << 7,
  // Portal
  PORTAL: 1 << 8,
}
VNODEFLAGS.ELEMENT = VNODEFLAGS.ELEMENT_HTML | VNODEFLAGS.ELEMENT_SVG
VNODEFLAGS.COMPONENT = VNODEFLAGS.COMPONENT_STATEFUL_NORMAL | VNODEFLAGS.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE | VNODEFLAGS.COMPONENT_STATEFUL_KEPT_ALIVE | VNODEFLAGS.COMPONENT_FUNCTIONAL
VNODEFLAGS.COMPONENT_STATEFUL = VNODEFLAGS.COMPONENT_STATEFUL_NORMAL | VNODEFLAGS.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE | VNODEFLAGS.COMPONENT_STATEFUL_KEPT_ALIVE

const CHILDRENFLAGS = {
  // 未知的 children 类型
  UNKNOWN_CHILDREN: 0,
  // 没有 children
  NO_CHILDREN: 1,
  // children 是单个 VNode
  SINGLE_VNODE: 1 << 1,

  // children 是多个拥有 key 的 VNode
  KEYED_VNODES: 1 << 2,
  // children 是多个没有 key 的 VNode
  NONE_KEYED_VNODES: 1 << 3
}
CHILDRENFLAGS.MULTIPLE_VNODES = CHILDRENFLAGS.KEYED_VNODES | CHILDRENFLAGS.NONE_KEYED_VNODES


export const VNodeFlags = VNODEFLAGS
export const ChildrenFlags = CHILDRENFLAGS
export const Fragment = Symbol()
export const Portal = Symbol()

export const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/
