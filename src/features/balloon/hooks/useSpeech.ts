import { useCallback, useRef } from 'react'

/**
 * 字母音标发音映射表
 * 使用英文单词/音节确保 Chrome 和 Safari 发音一致
 * 每个字母都用其标准英文名称发音
 */
const LETTER_PRONUNCIATION: Record<string, string> = {
  A: 'ay',
  B: 'bee',
  C: 'see',
  D: 'dee',
  E: 'ee',
  F: 'eff',
  G: 'jee',
  H: 'aych',
  I: 'eye',
  J: 'jay',
  K: 'kay',
  L: 'ell',
  M: 'em',
  N: 'en',
  O: 'oh',
  P: 'pee',
  Q: 'cue',
  R: 'are',
  S: 'ess',
  T: 'tee',
  U: 'you',
  V: 'vee',
  W: 'double you',
  X: 'ex',
  Y: 'why',
  Z: 'zee',
}

/**
 * Web Speech API TTS 语音系统
 * 只播报英文字母，跨浏览器发音一致
 */
export function useSpeech() {
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // 初始化
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis
  }

  /**
   * 播放英文字母
   * 使用音标映射确保 Chrome/Safari 发音一致
   */
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number }) => {
    const synth = synthRef.current
    if (!synth) return

    // 只提取第一个英文字母（忽略其他字符）
    const letterMatch = text.match(/[A-Za-z]/)
    if (!letterMatch) return
    
    // 转为大写，查找对应发音
    const letter = letterMatch[0].toUpperCase()
    const pronunciation = LETTER_PRONUNCIATION[letter]
    if (!pronunciation) return

    // 取消正在播放的语音
    synth.cancel()

    // 使用音标发音，确保跨浏览器一致
    const utterance = new SpeechSynthesisUtterance(pronunciation)
    utterance.lang = 'en-US'
    utterance.rate = options?.rate ?? 0.8
    utterance.pitch = options?.pitch ?? 1.1
    utterance.volume = 1

    // 尝试选择更友好的声音
    const voices = synth.getVoices()
    const preferredVoice = voices.find(v =>
      v.name.includes('Samantha') ||  // macOS Safari
      v.name.includes('Google US English') ||  // Chrome
      (v.lang === 'en-US' && v.localService)  // 本地英文语音
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    synth.speak(utterance)
  }, [])

  /**
   * 播报目标字母（新一轮开始）
   */
  const sayFind = useCallback((letter: string) => {
    speak(letter, { rate: 0.7, pitch: 1.2 })
  }, [speak])

  /**
   * 播报答对的字母
   */
  const sayCorrect = useCallback((letter: string) => {
    speak(letter, { rate: 0.8, pitch: 1.3 })
  }, [speak])

  /**
   * 播报点击的字母（答错时）
   */
  const sayWrong = useCallback((tappedLetter: string) => {
    speak(tappedLetter, { rate: 0.8, pitch: 1.1 })
  }, [speak])

  /**
   * 播报目标字母（飘走时重新提示）
   */
  const sayMissed = useCallback((letter: string) => {
    speak(letter, { rate: 0.7, pitch: 1.2 })
  }, [speak])

  /**
   * 播报单个字母
   */
  const sayLetter = useCallback((letter: string) => {
    speak(letter, { rate: 0.8, pitch: 1.2 })
  }, [speak])

  /**
   * 停止所有语音
   */
  const stop = useCallback(() => {
    synthRef.current?.cancel()
  }, [])

  return {
    speak,
    sayLetter,
    sayFind,
    sayCorrect,
    sayWrong,
    sayMissed,
    stop,
  }
}
