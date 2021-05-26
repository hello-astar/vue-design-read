import { VNodeFlags, ChildrenFlags } from '../config/consts.js'
import { createTextVNode } from './h.js'
import { patchData } from './patch.js'

const mountElement = function (vnode, container, isSVG) {
  const { tag, data, children, childFlags, flags } = vnode
  isSVG = isSVG || flags & VNodeFlags.ELEMENT_SVG
  const el = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag)
  vnode.el = el

  for (let key in data) {
    patchData(el, key, null, data[key], isSVG)
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
  const { tag, children, childFlags } = vnode
  // 获取挂载点
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag
  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    // 将 children 挂载到 target 上，而非 container
    mount(children, target, isSVG)
  } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
    for (let i = 0; i < children.length; i++) {
      // 将 children 挂载到 target 上，而非 container
      mount(children[i], target, isSVG)
    }
  }

  // 占位的空文本节点
  const placeholder = createTextVNode('')
  // 将该节点挂载到 container 中
  mountText(placeholder, container, null)
  // el 属性引用该节点
  vnode.el = placeholder.el
}

const mountStatefulComponent = function (vnode, container, isSVG) {
  // 创建组件实例
  const instance = new vnode.tag()
  // 初始化 props
  instance.$props = vnode.data
  instance._update = function () {
    // 如果 instance._mounted 为真，说明组件已挂载，应该执行更新操作
    if (instance._mounted) {
      // 1、拿到旧的 VNode
      const prevVNode = instance.$vnode
      // 2、重渲染新的 VNode
      const nextVNode = (instance.$vnode = instance.render())
      // 3、patch 更新
      patch(prevVNode, nextVNode, prevVNode.el.parentNode)
      // 4、更新 vnode.el 和 $el
      instance.$el = vnode.el = instance.$vnode.el
    } else {
      // 1、渲染VNode
      instance.$vnode = instance.render()
      // 2、挂载
      mount(instance.$vnode, container, isSVG)
      // 3、组件已挂载的标识
      instance._mounted = true
      // 4、el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
      instance.$el = vnode.el = instance.$vnode.el
      // 5、调用 mounted 钩子
      instance.mounted && instance.mounted()
    }
  }

  instance._update()
}

const mountFunctionalComponent = function (vnode, container, isSVG) {
    const $vnode = vnode.tag()
    mount($vnode, container, isSVG)
    vnode.el = $vnode.el
}

const mountComponent = function (vnode, container, isSVG) {
  if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container, isSVG)
  } else {
    mountFunctionalComponent(vnode, container, isSVG)
  }
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