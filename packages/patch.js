import mount from "./mount"
import { VNodeFlags, domPropsRE } from '../config/consts.js'

// 处理展开class
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

const patchData = function (el, key, prevValue, nextValue, isSVG) {
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
          el.setAttribute('class', serialization(nextValue.class || []))
        } else {
          el.className = serialization(nextValue.class || [])
        }
      }
      break
    default:
      if (key[0] === 'o' && key[1] === 'n') {
        // 事件
        el.addEventListener(key.slice(2), nextValue)
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
  mount(nextVNode, container)
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
}

const patchComponent = function (prevVNode, nextVNode, container) {

}

const patchText = function (prevVNode, nextVNode, container) {

}

const patchFragment = function (prevVNode, nextVNode, container) {

}

const patchPortal = function (prevVNode, nextVNode, container) {

}

export default function (prevVNode, nextVNode, container) {
  const nextFlags = nextVNode.flags
  const prevFlags = prevVNode.flags
  if (prevFlags !== nextFlags) { // flags不同，无需对比直接替换
      replaceVNode(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.ELEMENT) {
      patchElement(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.COMPONENT) {
      patchComponent(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.TEXT) {
      patchText(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.FRAGMENT) {
      patchFragment(prevVNode, nextVNode, container)
  } else if (nextFlags & VNodeFlags.PORTAL) {
      patchPortal(prevVNode, nextVNode, container)
  }
}