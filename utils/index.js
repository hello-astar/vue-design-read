// 计算最长递增子序列
export function lis (source) {
  let m = source.length
  let f = [...Array(m + 1).keys()].map(() => new Array(m + 1).fill(0))
  let application = [...Array(m + 1).keys()].map(() => new Array(m + 1).fill(-Infinity)) // 记录最后一位
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= m; j++) {
      let notIn = f[i-1][j] // 不放
      let canIn = 0 // 放
      let a = source[i - 1]
      for (let k = 0; k < i; k++) {
        if (!isFinite(application[k][j - 1]) || (application[k][j - 1] < source[i - 1] && f[k][j - 1] + 1 > canIn)) {
          canIn = f[k][j-1] + 1
          a = source[i - 1]
        }
      }
      if (notIn > canIn) {
        application[i][j] = application[i-1][j]
        f[i][j] = notIn
      } else if (notIn === canIn) {
        if (application[i-1][j] > a) {
          application[i][j] = a
        } else {
          application[i][j] = application[i-1][j]
        }
        f[i][j] = canIn
      } else {
        application[i][j] = a
        f[i][j] = canIn
      }
    }
  }
  let i = m
  let j = f[m][m]
  let res = []
  while(i > 0 && j > 0) {
    if (application[i][j] === source[i - 1] && f[i][j]) {
      res.unshift(i-1)
      j--
    }
    i--
  }
  return res
}