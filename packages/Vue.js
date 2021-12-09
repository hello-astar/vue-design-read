/*
 * @Description: mini-vue实现
 * @Author: astar
 * @Date: 2021-11-10 15:16:27
 * @LastEditTime: 2021-12-10 03:13:55
 * @LastEditors: astar
 */
import {
  START_TAG_REG,
  CLOSE_TAG_REG,
  END_TAG_REG,
  TYPE,
  ATTR_REG,
  EXPRESS_REG,
  DIRECTIVE_REG,
  TEXT_REG,
  TEXT_EXPRESS_REG
} from '@/config/consts'
import { h } from '@/packages/h.js'
import { render } from '@/packages/render.js'
import * as components from '@/component.js'
import { Fragment } from '../config/consts'

/**
* 入口Vue
* @author astar
* @date 2021-11-12 16:28
*/

export default class Vue {
  constructor (options) {
    this._init(options)
  }

  /**
  * 初始化
  * @author astar
  * @date 2021-11-18 14:12
  */
  _init (options) {
    this.$el = null
    this.$options = options || {}
    this.$container = typeof options.mountPlace === 'string' ? document.querySelector(options.mountPlace) : options.mountPlace
    this._initLifecycle()
    this.callHook('beforeCreate')
    this._data = this.$options.data()
    this._props = this.$options.props || {} // props
    // 数据代理
    const _this = this
    this._proxy(this, '_data', val => val)
    this._proxy(this.$options, 'computed', val => val.call(_this), (key) => { throw new Error('不能修改computed数据 => ' + key)})
    this._proxy(this.$options, 'methods', val => val.bind(_this), (key) => { throw new Error('不能修改methods => ' + key)})
    this._proxy(this, '_props', val => val, (key) => { throw new Error('不能修改props => ' + key)})
    // 数据劫持
    new Observer(this._data)
    this.callHook('created')
    // 模板解析
    this.$compiler = new Compiler(this)
    let watcher = new Watcher(this, function () {
      if (!this.$container) return
      !this._isMounted ? this.callHook('beforeMount') : this.callHook('beforeUpdate')
      this.$vnode = this.$compiler.createVNode()
      render(this.$vnode, this.$container)
      this.$el = this.$vnode.el
      !this._isMounted ? this.callHook('mounted') : this.callHook('updated')
      this._isMounted = true
    })
    watcher.update()
  }

  /**
  * 初始化生命周期
  * @author astar
  * @date 2021-11-18 16:00
  */
  _initLifecycle () {
    this._isMounted = false
    this._isDestroyed = false
    this._isBeingDestroyed = false
  }

  /**
  * 调用生命周期钩子函数
  * @author astar
  * @date 2021-11-18 16:05
  */
  callHook (hook) {
    this.$options[hook] && this.$options[hook]()
  }

  /**
  * 初始化事件
  * @author astar
  * @date 2021-11-18 16:02
  */
  _initEvents () {

  }

  /**
  * 数据代理，data\props\methods\computed等等
  * @author astar
  * @date 2021-11-18 13:47
  */
  _proxy (obj, originKey, getFunc, setFunc) {
    if (!obj[originKey] || typeof obj[originKey] !== 'object') return
    Object.keys(obj[originKey]).forEach(key => {
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get () {
          return getFunc(obj[originKey][key])
        },
        set (val) {
          setFunc && setFunc(key, val)
          obj[originKey][key] = val
        }
      })
    })
  }
}

/**
* 数据劫持
* @author astar
* @date 2021-11-12 16:28
*/
class Observer {
  constructor (data) {
    this.observe(data)
  }

  observe (data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive (data, key, value) {
    this.observe(value) // 继续劫持深层对象
    let dep = new Dep()
    Object.defineProperty(data, key, {
      configurable: false,
      enumerable: true,
      get: () => {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (val) => {
        if (value === val) return
        value = val
        this.observe(value) // 设置新的值需要继续劫持
        dep.notify()
      }
    })
  }
}

/**
* 模板解析
* @author astar
* @date 2021-11-12 16:31
*/
class Compiler {
  constructor (vm) {
    this.vm = vm
    this.createVNode = (vm.$options.render ? vm.$options.render : this.compile(vm.$options.template)).bind(vm, h) // 拼装生成vnode的函数
  }

  /**
  * 编译出生成VNode的函数
  * 先简单介绍一下编译原理的基本知识。
  * 众所周知，基本所有的现代编译器，整个编译过程可以分为三个阶段：
  * Parsing(解析)、 Transformation(转换)、Code Generation(代码生成)
    第一阶段：解析字符模板生成tokens，根据tokens生成AST语法树
    第二阶段：遍历AST语法树，进行语法树节点处理，修改原有的AST语法树或者生成一棵全新的AST语法树
    第三阶段：遍历转换后的AST语法树，生成目标字符串代码
  * @author astar
  * @date 2021-11-16 16:26
  */
  compile (input) {
    let tokens = this.tokenizer(input)
    let ast = this.parser(tokens)
    let newAst = this.transformer(ast)
    let code = this.codeGenerator(newAst)
    return new Function(['_wDirective', '_generateComponent'], code)(this._wDirective, this._generateComponent)
  }

  /**
  * 解析字符模板生成tokens
  * @author astar
  * @date 2021-11-16 16:35
  */
  tokenizer (originInput) {
    // 存储解析的token
    const tokens = []
    // 用于标签是否闭合正确的栈
    const stack = []
    // 清除所有换行符，并复制输入的字符模板
    let input = originInput.replace(/\n|\r/g, '')
    /**
     * 通过不断其匹配标签、属性等，不断的去截取匹配后的字符串
     * 当最总字符串长度为零，表示全部完成模板的解析
     */
    while (input.length) {
      // 清除首尾的空格
      input = input.trim()
      // 开始标签
      if (START_TAG_REG.test(input)) {
        const match = input.match(START_TAG_REG)
        if (match) {
          const [str, tagName, attrs] = match
          // 截取剩余模板字符串
          input = input.slice(str.length)
          const attrsVal = []
          // 判断是否为自闭合标签
          if (!CLOSE_TAG_REG.test(attrs)) {
            stack.push(tagName)
            tokens.push({ type: TYPE.START, tag: tagName, attrs: attrsVal, })
          } else {
            attrs.replace(CLOSE_TAG_REG, '')
            tokens.push({ type: TYPE.CLOSE, tag: tagName, attrs: attrsVal, })
          }
          // 开始标签中，需要提取标签属性
          if (attrs) {
            let rst = ''
            while ((rst = ATTR_REG.exec(attrs)) !== null) {
              const [str, attrName, _, attrValue] = rst
              // 判断是否为表达式属性
              if (EXPRESS_REG.test(attrName)) {
                attrsVal.push({ type: TYPE.EXPRESS, name: attrName.slice(1), value: attrValue })
                continue
              }
              // 指令类型
              if (DIRECTIVE_REG.test(attrName)) {
                const [directiveName, attrParams] = attrName.slice(2).split(':') // // v-on:click="attrValue"
                attrsVal.push({ type: TYPE.DIRECTIVE, name: `_${directiveName}`, value: attrValue, params: attrParams })
                continue
              }
              // 普通属性
              attrsVal.push({ type: TYPE.ATTR, name: attrName, value: attrValue, })
            }
          }
        }
        continue
      }
      // 文本内容
      if (TEXT_REG.test(input)) {
        const match = input.match(TEXT_REG)
        // 解析文本内容
        if (match) {
          let [str] = match
          input = input.slice(str.length)
          tokens.push({ type: TYPE.TEXT, value: str.trim() })
        }
        continue
      }
      // 结束标签
      if (END_TAG_REG.test(input)) {
        const match = input.match(END_TAG_REG)
        if (match) {
          const [str, tagName] = match
          input = input.slice(str.length)
          const startTagName = stack.pop()
          // 判断是否和开始标签匹配
          if (startTagName !== tagName) {
            throw new Error(`标签不匹配: ${tagName}`)
          }
          tokens.push({ type: TYPE.END, tag: tagName, })
        }
        continue
      }
      throw new Error(`解析模板出错: ${input}`)
    }
    if (stack.length > 0) {
      throw new Error(`标签不匹配: ${stack.toString()}`)
    }
    return tokens
  }
  
  parser (tokens) {
    const ast = {
      type: TYPE.ROOT,
      children: []
    }
    const stack = [ast]
    let current = 0, // 当前token索引
      token = null,
      len = tokens.length
  
    while (current < len) {
      token = tokens[current++]
      if (token.type === TYPE.START) {
        // 这里简单复制token 并加入children属性
        const node = Object.assign({
          children: []
        }, token)
        // 压入堆栈
        stack.push(node)
        continue
      }
      /**
       * 如果为结束标签的类型，则弹出栈当前节点 childNode
       * 我们可知它的父节点为当前栈的头部节点
       */
      if (token.type === TYPE.END) {
        const node = stack.pop()
        // 获取弹出节点的父节点
        const parent = stack[stack.length - 1]
        parent.children.push(node)
        continue
      }
      // 如果为自闭和节点 或者 文本节点，则直接放入父节点children 属性中
      if (token.type === TYPE.CLOSE || token.type === TYPE.TEXT) {
        // 获取弹出节点的父节点
        const parent = stack[stack.length - 1]
        parent.children.push(token)
        continue
      }
      throw new TypeError(token.type)
    }
    return ast
  }

  transformer (ast) {
    // 这里处理指令编译
    function parseDirective (node, parent) {
      if (node.attrs.length >= 0) {
        const directives = node.attrs.filter(item => item.type === TYPE.DIRECTIVE)
        node.directives = directives
        node.attrs = node.attrs.filter(item => item.type !== TYPE.DIRECTIVE)
      }
    }
    this.traverser(ast, {
      // 开始标签
      [TYPE.START]: {
        enter(node, parent) {
          parseDirective(node, parent)
        }
      },
      // 自闭合标签
      [TYPE.CLOSE]: {
        enter(node, parent) {
          parseDirective(node, parent)
        }
      }
    })
    return ast
  }

  traverser (ast, visitor) {
    const traverseArray = (array, parent) => {
      array.forEach(child => {
        traverseNode(child, parent)
      })
    }
    const traverseNode = (node, parent) => {
      let methods = visitor[node.type]
      // 调用对应节点，遍历节点钩子函数
      if (methods && methods.enter) {
        methods.enter(node, parent)
      }
      switch (node.type) {
        case TYPE.ROOT:
        case TYPE.START:
          traverseArray(node.children, node)
          break
        case TYPE.CLOSE:
        case TYPE.TEXT:
          break
        default:
          throw new TypeError(node.type)
      }
      if (methods && methods.exit) {
        methods.exit(node, parent)
      }
    }
    traverseNode(ast, null)
  }

  codeGenerator (node) {
    function recursionGenerator (node) {
      switch (node.type) {
        case TYPE.ROOT: // 抽象语法的根节点
          return `return function (_c) { with (this) { return ${recursionGenerator(node.children[0])} } }`
        case TYPE.START:
        case TYPE.CLOSE:
          let code = null
          let for_directive = node.directives.find(item => item.name === '_for')
          if (for_directive) {
            let forStr = for_directive.value.replace(/(.*)\sin\s\b(.*)\b/g, function (str, a, b) {
              // 解析 v-for="(item, idx) in obj" 或 v-for="item in obj"
              a = a.replace(/^(\()?(.*?)(\))?$/g, '[$2]')
              return `for (var key in ${b}) {
                var ${a} = [${b}[key], key]
              `
            })
            node.directives = node.directives.filter(item => item.name !== '_for')
            code = `(function () {
              let reg = /(.*)\sin\s\b(.*)\b/g
              let children = []
              ${forStr} 
                children.push(${recursionGenerator(node)})
              }
              return _c(_generateComponent(this, 'Fragment'), null, children)
            })()`
          } else {
            code = 
              `_c(_generateComponent(this, '${node.tag}'),
                {${node.attrs.map(recursionGenerator)}},
                ${node.children ? '[' + node.children.map(recursionGenerator) + ']' : null}
              )`
            // 处理指令的情况
            if (node.directives && node.directives.length > 0) {
              return (`_wDirective(this, ${code}, [${node.directives.map(recursionGenerator)}])`)
            }
          }
    
          return code
        case TYPE.TEXT:
          // 将{{xx}}替换为this.xx
          let str = `"${node.value}"`
          while (TEXT_EXPRESS_REG.test(str)) {
            str = str.replace(TEXT_EXPRESS_REG, (a, b) => {
              return `" + ${b} + "`
            })
          }
          return (`_c(null, null, ${str})`)
        case TYPE.ATTR: // 属性
          return (`${node.name}: "${node.value}"`)
        case TYPE.EXPRESS: // 表达式
          return (`${node.name}: ${node.value}`)
        case TYPE.DIRECTIVE: // 指令
          // value可以是变量名称也可以是表达式 // 需要解析
          // v-on:click='add' => value = 'add' params = 'click'
          // v-for='item in arr' => value = 'item in arr' params=undefined
          return (`{ name: '${node.name}', value: '${node.value}', params: '${node.params}' }`)
        default:
          throw new TypeError(node.type)
      }
    }
    return recursionGenerator(node)
  }

  _wDirective (vm, vnode, directives) {
    directives.forEach(directive => {
      vnode = (
        Compiler.utils[directive.name] && Compiler.utils[directive.name](vm, vnode, directive)
      ) || vnode
    })
    return vnode
  }
  
  // 生成组件
  _generateComponent (vm, tag) {
    return components[tag] || (tag === 'Fragment' ? Fragment : tag)
  }
}

/**
 * 指令处理总结
 */
 Compiler.utils = {
  _model: function (vm, vnode, directive) {
    let { value } = directive
    vnode.data.value = vm[value]
    vnode.data['oninput'] = function (e) {
      vm.input = e.target.value
    }
  },
  _show: function (vm, vnode, directive) { // v-show
    let { value } = directive
    vnode.data.style = vnode.data.style || {}
    vnode.data.style.visibility = vm[value] ? 'visible' : 'hidden'
  },
  _on: function (vm, vnode, directive) { // patchData函数已经做了统一的事件处理
    let { value, params } = directive
    vnode.data[`on${params}`] = vm[value]
  }
  // _for: function (vm, vnode, directive) {
  //   console.log(vnode, directive)
  //   debugger
  //   // let a = h('div', null, 'hello')
  //   // console.log(a)
  //   // vnode.children = a
  //   // vnode.childFlags = ChildrenFlags.SINGLE_VNODE
  //   return h(Fragment, null, [vnode, vnode])
  // }
}

/**
* 消息发布者
* @author astar
* @date 2021-11-16 16:31
*/
class Dep {
  constructor () {
    this.subs = new Set()
  }

  addSub (watcher) {
    this.subs.add(watcher)
  }

  notify () {
    this.subs.forEach(watcher => watcher.update())
  }
}

/**
* 消息订阅者
* 作为桥梁，实现双向数据绑定
* @author astar
* @date 2021-11-16 16:31
*/
class Watcher {
  constructor (vm, func) {
    this.vm = vm
    this.cb = func
    this.get() // 预生成vnode，才能将watcher加入dep中
  }

  get () {
    Dep.target = this
    this.vm.$compiler.createVNode()
    Dep.target = null
  }

  // 数据更新 -> 页面更新
  update () {
    this.cb.call(this.vm)
  }
}
export class VueComponent extends Vue {
  constructor (options) {
    super(options)
  }
}