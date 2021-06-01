// 计算最长递增子序列
export function lis (source) {
  console.log(source)
  let m = source.length
  let f = new Array(m + 1).fill(null).map(() => new Array(m + 1).fill(0))
  let application = new Array(m + 1).fill(null).map(() => new Array(m + 1).fill(-Infinity)) // 记录最后一位
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= m; j++) {
      if (source[i] > application[i-1][j-1]) {
        application[i][j] = source[i]
        f[i][j] = f[i-1][j-1]++
      } else {
        application[i][j] = application[i-1][j]
        f[i][j] = f[i-1][j]++
      }
    }
  }
  console.log(f, application)
  return [1, 2]
}