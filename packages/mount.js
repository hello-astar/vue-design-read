/*
 * @Author: astar
 * @Date: 2021-05-19 15:24:13
 * @LastEditors: astar
 * @LastEditTime: 2021-05-20 13:50:18
 * @Description: 文件描述
 * @FilePath: \vue\packages\mount.js
 */
import { VNodeFlags, ChildrenFlags } from '../config/consts.js'
import { createTextVNode } from './createVNode.js'

const serialization = function (args) {
  let res = ''
  for (let item of args) {
      if (typeof item === 'string') {
          res += item
      } else if (Array.isArray(item)) {
          res += (' ' + item.join(' '))
      } else {
          for (let key in item) {
              if (item[key]) {
                  res += (' ' + key)
              }
          }
      }
  }
  return res
}

const mountElement = function (vnode, container, isSVG) {
  const { tag, data, children, childFlags, flags } = vnode
  isSVG = isSVG || flags & VNodeFlags.ELEMENT_SVG
  const el = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag)
  vnode.el = el

  for (let key in data) {
    switch (key) {
      case 'style':
        for (let k in data[key]) {
          el.style[k] = data[key][k]
        }
        break
      case 'class':
        if (isSVG) {
          el.setAttribute('class', serialization(data.class))
        } else {
          el.className = serialization(data.class)
        }
        break
      default:
        const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/
        if (key[0] === 'o' && key[1] === 'n') {
            // 事件
            el.addEventListener(key.slice(2).toLowerCase(), data[key])
        } else if (domPropsRE.test(key)) {
            // 当作 DOM Prop 处理
            el[key] = data[key]
        } else {
            // 当作 Attr 处理
            el.setAttribute(key, data[key])
        }
        break
    }
  }

  // 处理children
  if (childFlags !== ChildrenFlags.NO_CHILDREN) {
    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
      mount(children, el, isSVG)
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
      for (let i = 0; i < children.length; i++) {
        mount(children[i], el, isSVG)
      }
    }
  }

  container.appendChild(el)
}

const mountText = function (vnode, container) {
  const { children } = vnode
  const el = document.createTextNode(children)
  vnode.el = el
  container.appendChild(el)
}

const mountFragment = function (vnode, container, isSVG) {
  const { childFlags, children } = vnode
  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    mount(children, container, isSVG)
    vnode.el = children.el
  } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
    for (let i = 0; i < children.length; i++) {
      mount(children[i], container, isSVG)
    }
    vnode.el = children[0].el
  } else if (childFlags & ChildrenFlags.NO_CHILDREN) {
    // 默认创建一个空的占位符
    const placeholder = createTextVNode('')
    mountText(placeholder, container)
    vnode.el = placeholder.el
  }
}

const mountPortal = function (vnode, container, isSVG) {

}

const mountComponent = function (vnode, container, isSVG) {
  
}

const mount = function (vnode, container, isSVG) {
  const { flags } = vnode
  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container, isSVG)
  } else if (flags & VNodeFlags.COMPONENT) {
    mountComponent(vnode, container, isSVG)
  } else if (flags & VNodeFlags.TEXT) {
    mountText(vnode, container)
  } else if (flags & VNodeFlags.FRAGMENT) {
    mountFragment(vnode, container, isSVG)
  } else if (flags & VNodeFlags.PORTAL) {
    mountPortal(vnode, container, isSVG)
  }
}

export default mount