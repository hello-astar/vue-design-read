import mount from "./mount"
import { VNodeFlags, ChildrenFlags ,domPropsRE } from '../config/consts.js'

// 处理展开class
const serialization = function (args = []) {
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

export const patchData = function (el, key, prevValue, nextValue, isSVG) {
  switch (key) {
    case 'style':
      for (let k in nextValue) {
        el.style[k] = nextValue[k]
      }
      for (let k in prevValue) {
        if (!nextValue.hasOwnProperty(k)) {
          el.style[k] = ''
        }
      }
      break
    case 'class':
      if (nextValue) {
        if (isSVG) {
          el.setAttribute('class', serialization(nextValue))
        } else {
          el.className = serialization(nextValue)
        }
      }
      break
    default:
      if (key[0] === 'o' && key[1] === 'n') {
        // 事件
        // 移除旧事件
        if (prevValue) {
          el.removeEventListener(key.slice(2), prevValue)
        }
        // 添加新事件
        if (nextValue) {
          el.addEventListener(key.slice(2), nextValue)
        }
      } else if (domPropsRE.test(key)) {
        // 当作 DOM Prop 处理
        el[key] = nextValue
      } else {
        // 当作 Attr 处理
        el.setAttribute(key, nextValue)
      }
      break
  }
}

const replaceVNode = function (prevVNode, nextVNode, container) {
  container.removeChild(prevVNode.el)
  // 如果将要被移除的 VNode 类型是组件，则需要调用该组件实例的 unmounted 钩子函数
  if (prevVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    // 类型为有状态组件的 VNode，其 children 属性被用来存储组件实例对象
    const instance = prevVNode.children
    instance.unmounted && instance.unmounted()
  }
  mount(nextVNode, container)
}

// react的diff算法
const diff1 = function (prevChildren, nextChildren, container) {
  // 用来存储寻找过程中遇到的最大索引值
  let lastIndex = 0
  // 遍历新的 children
  for (let i = 0; i < nextChildren.length; i++) {
    const nextVNode = nextChildren[i]
    // 遍历旧的 children
    let find = false
    let j = 0
    for (; j < prevChildren.length; j++) {
      const prevVNode = prevChildren[j]
      // 如果找到了具有相同 key 值的两个节点，则调用 `patch` 函数更新之
      if (nextVNode.key === prevVNode.key) {
        find = true
        patch(prevVNode, nextVNode, container)
        if (j < lastIndex) {
          // 需要移动
          // refNode 是为了下面调用 insertBefore 函数准备的
          const refNode = nextChildren[i - 1].el.nextSibling
          // 调用 insertBefore 函数移动 DOM
          container.insertBefore(prevVNode.el, refNode)
        } else {
          // 更新 lastIndex
          lastIndex = j
        }
        break // 这里需要 break
      }
    }
    // 找不到相同的key
    if (!find) {
      // 这种办法还是会多移动数据例如1,2,3 => 6,1,2,3将6插入到最后面，导致1,2,3节点需要依次移动到6后面
      // mount(nextVNode, container, nextVNode.flag & VNodeFlags.ELEMENT_SVG)
      // lastIndex = j
      // 所以还是直接把6插入到第一位吧
      const refNode =
        i - 1 < 0
          ? prevChildren[0].el
          : nextChildren[i - 1].el.nextSibling
      mount(nextVNode, container, nextVNode.flag & VNodeFlags.ELEMENT_SVG, refNode)
    }
  }

  // 移除已经不存在的节点
  // 遍历旧的节点
  for (let i = 0; i < prevChildren.length; i++) {
    const prevVNode = prevChildren[i]
    // 拿着旧 VNode 去新 children 中寻找相同的节点
    const has = nextChildren.find(
      nextVNode => nextVNode.key === prevVNode.key
    )
    if (!has) {
      // 如果没有找到相同的节点，则移除
      container.removeChild(prevVNode.el)
    }
  }
}
// vue2的diff算法 -- 双端比较
const diff2 = function (prevChildren, nextChildren, container) {
  let oldStartIdx = 0
  let oldEndIdx = prevChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = nextChildren.length - 1
  let oldStartVNode = prevChildren[oldStartIdx]
  let oldEndVNode = prevChildren[oldEndIdx]
  let newStartVNode = nextChildren[newStartIdx]
  let newEndVNode = nextChildren[newEndIdx]
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = prevChildren[++oldStartIdx]
    } else if (!oldEndVNode) {
      oldEndVNode = prevChildren[--oldEndIdx]
    } else if (oldStartVNode.key === newStartVNode.key) {
      // 步骤一：oldStartVNode 和 newStartVNode 比对
      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = prevChildren[++oldStartIdx]
      newStartVNode = nextChildren[++newStartIdx]
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 步骤二：oldEndVNode 和 newEndVNode 比对
      patch(oldEndVNode, newEndVNode, container)
      oldEndVNode = prevChildren[--oldEndIdx]
      newEndVNode = nextChildren[--newEndIdx]
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 步骤三：oldStartVNode 和 newEndVNode 比对
      patch(oldStartVNode, newEndVNode, container)
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)
      oldStartVNode = prevChildren[++oldStartIdx]
      newEndVNode = nextChildren[--newEndIdx]
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 步骤四：oldEndVNode 和 newStartVNode 比对
      // 先调用 patch 函数完成更新
      patch(oldEndVNode, newStartVNode, container)
      // 更新完成后，将容器中最后一个子节点移动到最前面，使其成为第一个子节点
      container.insertBefore(oldEndVNode.el, oldStartVNode.el)
      // 更新索引，指向下一个位置
      oldEndVNode = prevChildren[--oldEndIdx]
      newStartVNode = nextChildren[++newStartIdx]
    } else {
      // 非理想情况下
      // 遍历旧 children，试图寻找与 newStartVNode 拥有相同 key 值的元素
      const idxInOld = prevChildren.findIndex(
        node => node && node.key === newStartVNode.key
      )
      if (idxInOld !== -1) {
        patch(prevChildren[idxInOld], newStartVNode, container)
        container.insertBefore(prevChildren[idxInOld].el, oldStartVNode.el)
        prevChildren[idxInOld] = undefined
      } else {
        mount(newStartVNode, container, newStartVNode.flag & VNodeFlags.ELEMENT_SVG, oldStartVNode.el)
      }
      newStartVNode = nextChildren[++newStartIdx]
    }
  }
  if (oldEndIdx < oldStartIdx) {
    // 添加新节点
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mount(nextChildren[i], container, false, oldEndVNode.el.nextSibling)
    }
  } else if (newEndIdx < newStartIdx) {
    // 移除操作
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      container.removeChild(prevChildren[i].el)
    }
  }
}
// vue3的diff算法
const diff3 = function (prevChildren, nextChildren, container) {
  // 更新相同的前缀节点
  // j 为指向新旧 children 中第一个节点的索引
  let j = 0
  let prevVNode = prevChildren[j]
  let nextVNode = nextChildren[j]
  // while 循环向后遍历，直到遇到拥有不同 key 值的节点为止
  while (prevVNode && nextVNode && prevVNode.key === nextVNode.key) {
    // 调用 patch 函数更新
    patch(prevVNode, nextVNode, container)
    j++
    prevVNode = prevChildren[j]
    nextVNode = nextChildren[j]
  }
  // 更新相同的后缀节点

  // 指向旧 children 最后一个节点的索引
  let prevEnd = prevChildren.length - 1
  // 指向新 children 最后一个节点的索引
  let nextEnd = nextChildren.length - 1

  prevVNode = prevChildren[prevEnd]
  nextVNode = nextChildren[nextEnd]

  // while 循环向前遍历，直到遇到拥有不同 key 值的节点为止
  while (prevVNode && nextVNode && prevVNode.key === nextVNode.key) {
    // 调用 patch 函数更新
    patch(prevVNode, nextVNode, container)
    prevVNode = prevChildren[--prevEnd]
    nextVNode = nextChildren[--nextEnd]
  }

  // 满足条件，则说明从 j -> nextEnd 之间的节点应作为新节点插入
  if (j > prevEnd && j <= nextEnd) {
    // 所有新节点应该插入到位于 nextPos 位置的节点的前面
    const nextPos = nextEnd + 1
    const refNode = nextPos < nextChildren.length ? nextChildren[nextPos].el : null
    // 采用 while 循环，调用 mount 函数挂载节点
    while (j <= nextEnd) {
      mount(nextChildren[j++], container, false, refNode)
    }
  } else if (j > nextEnd) {
    while (j <= prevEnd) {
      container.removeChild(prevChildren[j++].el)
    }
  } else {
    // diff2(prevChildren, nextChildren, container)
  }
}
// 3 * 3 = 9种情况
const patchChildren = function (prevChildFlags, nextChildFlags, prevChildren, nextChildren, container) {
  switch (prevChildFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          patch(prevChildren, nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          container.removeChild(prevChildren.el)
          break
        default:
          container.removeChild(prevChildren.el)
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    case ChildrenFlags.NO_CHILDREN:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          mount(nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          break
        default:
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container)
          }
          break
      }
      break
    default:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          for(let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el)
          }
          mount(nextChildren, container)
          break
        case ChildrenFlags.NO_CHILDREN:
          for(let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el)
          }
          break
        default:
          diff3(prevChildren, nextChildren, container)
          // diff2(prevChildren, nextChildren, container)
          // diff1(prevChildren, nextChildren, container)
          break
      }
      break
  }
}

const patchElement = function (prevVNode, nextVNode, container) {
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container)
    return
  }
  // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
  const el = (nextVNode.el = prevVNode.el)
  // 拿到 新旧 VNodeData
  const prevData = prevVNode.data || {}
  const nextData = nextVNode.data || {}
  // 新的 VNodeData 存在时才有必要更新
  if (nextData) {
    // 遍历新的 VNodeData
    for (let key in nextData) {
      // 根据 key 拿到新旧 VNodeData 值
      const prevValue = prevData[key]
      const nextValue = nextData[key]
      patchData(el, key, prevValue, nextValue)
    }
  }
  if (prevData) {
    // 遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据移除
    for (let key in prevData) {
      const prevValue = prevData[key]
      if (prevValue && !nextData.hasOwnProperty(key)) {
        // 第四个参数为 null，代表移除数据
        patchData(el, key, prevValue, null)
      }
    }
  }

  // 调用 patchChildren 函数递归地更新子节点
  patchChildren(
    prevVNode.childFlags, // 旧的 VNode 子节点的类型
    nextVNode.childFlags, // 新的 VNode 子节点的类型
    prevVNode.children,   // 旧的 VNode 子节点
    nextVNode.children,   // 新的 VNode 子节点
    el                    // 当前标签元素，即这些子节点的父节点
  )
}

const patchComponent = function (prevVNode, nextVNode, container) {
  if (nextVNode.tag !== prevVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container)
  } else if (nextVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) { // 有状态组件
      // 1、获取组件实例
      const instance = (nextVNode.children = prevVNode.children)
      // 2、更新 props
      instance.$props = nextVNode.data
      // 3、更新组件
      instance._update()
  } else { // 函数式组件
    // 通过 prevVNode.handle 拿到 handle 对象
    const handle = (nextVNode.handle = prevVNode.handle)
    // 更新 handle 对象
    handle.prev = prevVNode
    handle.next = nextVNode
    handle.container = container

    // 调用 update 函数完成更新
    handle.update()
  }
}

const patchText = function (prevVNode, nextVNode) {
  const el = (nextVNode.el = prevVNode.el)
  if (nextVNode.children !== prevVNode.children) {
      el.nodeValue = nextVNode.children
  }
}

const patchFragment = function (prevVNode, nextVNode, container) {
  // 直接调用 patchChildren 函数更新 新旧片段的子节点即可
  patchChildren(
    prevVNode.childFlags, // 旧片段的子节点类型
    nextVNode.childFlags, // 新片段的子节点类型
    prevVNode.children,   // 旧片段的子节点
    nextVNode.children,   // 新片段的子节点
    container
  )
  switch (nextVNode.childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      nextVNode.el = nextVNode.children.el
      break
    case ChildrenFlags.NO_CHILDREN:
      nextVNode.el = prevVNode.el
      break
    default:
      nextVNode.el = nextVNode.children[0].el
  }
}

const patchPortal = function (prevVNode, nextVNode, container) {
  patchChildren(
    prevVNode.childFlags,
    nextVNode.childFlags,
    prevVNode.children,
    nextVNode.children,
    prevVNode.tag // 注意容器元素是旧的 container
  )
  // 让 nextVNode.el 指向 prevVNode.el
  nextVNode.el = prevVNode.el

  // 如果新旧容器不同，才需要搬运
  if (nextVNode.tag !== prevVNode.tag) {
    // 获取新的容器元素，即挂载目标
    const container =
      typeof nextVNode.tag === 'string'
        ? document.querySelector(nextVNode.tag)
        : nextVNode.tag

    switch (nextVNode.childFlags) {
      case ChildrenFlags.SINGLE_VNODE:
        // 如果新的 Portal 是单个子节点，就把该节点搬运到新容器中
        container.appendChild(nextVNode.children.el)
        break
      case ChildrenFlags.NO_CHILDREN:
        // 新的 Portal 没有子节点，不需要搬运
        break
      default:
        // 如果新的 Portal 是多个子节点，遍历逐个将它们搬运到新容器中
        for (let i = 0; i < nextVNode.children.length; i++) {
          container.appendChild(nextVNode.children[i].el)
        }
        break
    }
  }
}

function patch (prevVNode, nextVNode, container) {
  const nextFlags = nextVNode.flags
  const prevFlags = prevVNode.flags
  if (prevFlags !== nextFlags) { // flags不同，无需对比直接替换
      replaceVNode(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.ELEMENT) {
      patchElement(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.COMPONENT) {
      patchComponent(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.TEXT) {
      patchText(prevVNode, nextVNode)
  } else if (nextFlags & VNodeFlags.FRAGMENT) {
      patchFragment(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.PORTAL) {
      patchPortal(prevVNode, nextVNode, container)
  }
}

export default patch