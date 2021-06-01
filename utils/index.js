// 计算最长递增子序列
export function lis (source) {
  console.log(source)
  let m = source.length
  let f = new Array(m + 1).fill(null).map(() => new Array(m + 1).fill(0))
  let application = new Array(m + 1).fill(null).map(() => new Array(m + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= m; j++) {
    }
  }
  return [1, 2]
}