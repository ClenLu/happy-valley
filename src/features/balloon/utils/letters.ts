// 字母工具函数

// 全部 26 个字母
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * 随机获取一个字母
 */
export function getRandomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

/**
 * 随机获取多个不重复的字母
 */
export function getRandomLetters(count: number, mustInclude?: string): string[] {
  const available = [...LETTERS]
  const result: string[] = []

  // 如果必须包含某个字母，先添加它
  if (mustInclude) {
    result.push(mustInclude)
    const idx = available.indexOf(mustInclude)
    if (idx > -1) available.splice(idx, 1)
  }

  // 随机填充剩余字母
  while (result.length < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length)
    result.push(available[idx])
    available.splice(idx, 1)
  }

  // 打乱顺序
  return shuffleArray(result)
}

/**
 * Fisher-Yates 洗牌算法
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
