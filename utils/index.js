/**
 * 什么是最长递增子序列：给定一个数值序列，找到它的一个子序列，并且子序列中的值是递增的，子序列中的元素在原序列中不一定连续。

 * 例如给定数值序列为：[ 0, 8, 4, 12 ]

 * 那么它的最长递增子序列就是：[0, 8, 12]

 * 当然答案可能有多种情况，例如：[0, 4, 12] 也是可以的

 * 对应的下标是 [0, 1, 3] 或 [0, 2, 3]
 */

// 计算最长递增子序列对应的下标 - 我的动态规划法 - 参考0-1背包问题
export function lisMine (source) {
  let m = source.length
  // f[i][j]表示前i个数字按递增顺序放入j容量的背包内最多能放多少个
  // application[i][j]记录f[i][j]递增数字的最后一位
  let f = [...Array(m + 1).keys()].map(() => new Array(m + 1).fill(0))
  let application = [...Array(m + 1).keys()].map(() => new Array(m + 1).fill(-Infinity)) // 记录最后一位
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= m; j++) {
      let notIn = f[i - 1][j] > f[i][j - 1] ? f[i - 1][j] : f[i][j - 1] // 不放时最大值
      let notInLast = f[i - 1][j] === f[i][j - 1] ? (application[i - 1][j] < application[i][j - 1] ? application[i - 1][j] : application[i][j - 1]) : (f[i-1][j] > f[i][j - 1] ? application[i - 1][j] : application[i][j - 1])
      let canIn = 0 // 放时最大值
      for (let k = 0; k < i; k++) {
        if (application[k][j - 1] < source[i - 1] && f[k][j - 1] + 1 > canIn) {
          canIn = f[k][j - 1] + 1
        }
      }
      f[i][j] = notIn > canIn ? notIn : canIn
      if (notIn > canIn) {
        application[i][j] = notInLast
      } else if (notIn === canIn) {
        application[i][j] = notInLast > source[i - 1] ? source[i - 1] : notInLast
      } else {
        application[i][j] = source[i - 1]
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

// 动态规划法求最长递增子序列
export function lis(nums) {
  let dp = Array(nums.length).fill(1)
  for(let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[j] + 1, dp[i])
      }
    }
  }
  let len = nums.length
  let i = Math.max(...dp)
  let res = []
  while (len--) {
    if (dp[len] === i) {
      res.unshift(len)
      i--
    }
  }
  return res
}
