/*
 * @Author: astar
 * @Date: 2021-05-19 15:31:14
 * @LastEditors: astar
 * @LastEditTime: 2021-12-09 22:32:59
 * @Description: 文件描述
 * @FilePath: \vue\config\consts.js
 */
// VNode部分
const VNODEFLAGS = {
  // html 标签
  ELEMENT_HTML: 1,
  // SVG 标签
  ELEMENT_SVG: 1 << 1, // 左移

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
  PORTAL: 1 << 8
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
export const Fragment = Symbol() // 生成唯一标识
export const Portal = Symbol()

export const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/


// AST语法树部分
export const TYPE = {
  START: 'start', // 开始标签
  CLOSE: 'close', // 自闭合标签
  END: 'end', // 闭合标签
  TEXT: 'text', // 文本标签
  ROOT: 'root', // 根节点
  FRAGMENT: 'fragment',
  ATTR: 'attr', // 标签属性
  EXPRESS: 'express', // 表达式属性
  DIRECTIVE: 'directive' // 指令
}
// token匹配的正则表达式
// 匹配开始标签 例如 <div class="app">
export const START_TAG_REG = /^<\s*([a-z-_]+)\s*([^>]*)>/i
// 匹配结束标签 例如 </div>
export const END_TAG_REG = /^<\s*\/\s*([a-z-_]+)\s*>/i
// 判断是否为自闭和标签 例如  <input :value="model"/>
export const CLOSE_TAG_REG = /\/\s*$/
// 匹配属性 例如 class="app"
export const ATTR_REG = /([\w-:]+)\s*(=\s*"([^"]+)")?/ig
// 判断是否为动态属性 例如 :value="model"、{{test}}
export const EXPRESS_REG = /^:/
// 判断是否为指令
export const DIRECTIVE_REG = /^v-/
// 提取文本节点 mini-vue
export const TEXT_REG = /^[^<>]+/
// 提取文本节点的{{}}
export const TEXT_EXPRESS_REG = /\{\{(.*?)\}\}/