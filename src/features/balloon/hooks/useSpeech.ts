import { useCallback, useRef } from 'react'

/**
 * Web Speech API TTS 语音系统
 * 只播报英文字母
 */
export function useSpeech() {
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // 初始化
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis
  }

  /**
   * 播放英文字母
   */
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number }) => {
    const synth = synthRef.current
    if (!synth) return

    // 取消正在播放的语音
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = options?.rate ?? 0.8
    utterance.pitch = options?.pitch ?? 1.1
    utterance.volume = 1

    // 尝试选择更友好的声音
    const voices = synth.getVoices()
    const preferredVoice = voices.find(v =>
      v.name.includes('Samantha') ||  // macOS
      v.name.includes('Google US English') ||
      v.lang === 'en-US'
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
