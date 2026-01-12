/**
 * 音乐系统 - 按键即音符
 *
 * 灵感来自《动物森友会》和《Wii Music》：
 * - 背景音乐作为和声基调
 * - 每次点击触发与当前和弦一致的音符
 * - 无论怎么按，听起来都是和谐的
 */

// C 大调音阶（明亮、欢快）
const C_MAJOR_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
]

// 和弦进行（I-V-vi-IV，最经典的流行和弦）
const CHORD_PROGRESSION = [
  [0, 2, 4], // C major (C-E-G)
  [4, 7, 2], // G major (G-B-D)
  [5, 0, 2], // A minor (A-C-E)
  [3, 5, 0], // F major (F-A-C)
]

// 节奏配置
const RHYTHM_CONFIG = {
  bpm: 100, // 每分钟节拍数
  beatsPerBar: 4, // 每小节拍数
  chordChangeInterval: 4, // 每4拍换一个和弦
}

export class MusicSystem {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null

  // 背景音乐状态
  private currentChordIndex = 0
  private currentBeat = 0
  private beatInterval: number | null = null
  private isPlaying = false

  // 音符池（避免点击过快时的音频重叠）
  private notePool: Map<number, { osc: OscillatorNode; gain: GainNode; endTime: number }[]> = new Map()

  constructor() {
    this.initAudioContext()
  }

  /**
   * 初始化 Web Audio Context
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // 主音量控制
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.3 // 整体音量
      this.masterGain.connect(this.audioContext.destination)

      // BGM 音量控制
      this.bgmGain = this.audioContext.createGain()
      this.bgmGain.gain.value = 0.15 // BGM 较轻，不抢戏
      this.bgmGain.connect(this.masterGain)
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }

  /**
   * 开始播放背景音乐
   */
  start(): void {
    if (!this.audioContext || this.isPlaying) return

    // 恢复 AudioContext（浏览器安全策略）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    this.isPlaying = true
    this.currentChordIndex = 0
    this.currentBeat = 0

    // 启动节拍器
    const beatDuration = (60 / RHYTHM_CONFIG.bpm) * 1000
    this.beatInterval = window.setInterval(() => {
      this.onBeat()
    }, beatDuration)

    // 立即播放第一个和弦
    this.playChordArpeggio()
  }

  /**
   * 停止背景音乐
   */
  stop(): void {
    if (!this.isPlaying) return

    this.isPlaying = false

    if (this.beatInterval !== null) {
      clearInterval(this.beatInterval)
      this.beatInterval = null
    }

    // 清理所有音符
    this.notePool.clear()
  }

  /**
   * 节拍回调
   */
  private onBeat(): void {
    this.currentBeat++

    // 每 N 拍换一个和弦
    if (this.currentBeat % RHYTHM_CONFIG.chordChangeInterval === 0) {
      this.currentChordIndex = (this.currentChordIndex + 1) % CHORD_PROGRESSION.length
      this.playChordArpeggio()
    }
  }

  /**
   * 播放和弦琶音（背景音乐）
   */
  private playChordArpeggio(): void {
    if (!this.audioContext || !this.bgmGain) return

    const chord = CHORD_PROGRESSION[this.currentChordIndex]
    const now = this.audioContext.currentTime
    const noteDuration = 0.3

    // 琶音：依次播放和弦中的音符
    chord.forEach((noteIndex, i) => {
      const freq = C_MAJOR_SCALE[noteIndex]
      const startTime = now + i * 0.1

      this.playTone(freq, startTime, noteDuration, 0.08, this.bgmGain!)
    })
  }

  /**
   * 播放点击音符（与当前和弦和谐）
   */
  playClickNote(): void {
    if (!this.audioContext || !this.masterGain) return

    // 从当前和弦中随机选一个音符
    const chord = CHORD_PROGRESSION[this.currentChordIndex]
    const randomNoteIndex = chord[Math.floor(Math.random() * chord.length)]

    // 随机选择高八度或低八度，增加变化
    const octaveShift = Math.random() > 0.5 ? 1.5 : 1.0
    const freq = C_MAJOR_SCALE[randomNoteIndex] * octaveShift

    const now = this.audioContext.currentTime
    const noteDuration = 0.2

    // 点击音符音量较大，突出感
    this.playTone(freq, now, noteDuration, 0.25, this.masterGain)

    // 额外播放一个轻柔的泛音，增加丰富度
    const harmonicFreq = freq * 2
    this.playTone(harmonicFreq, now, noteDuration * 0.5, 0.08, this.masterGain)
  }

  /**
   * 播放正确音效（上升音阶）
   */
  playCorrectSound(): void {
    if (!this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const chord = CHORD_PROGRESSION[this.currentChordIndex]

    // 快速上升琶音
    chord.forEach((noteIndex, i) => {
      const freq = C_MAJOR_SCALE[noteIndex] * 1.5
      const startTime = now + i * 0.05
      this.playTone(freq, startTime, 0.15, 0.2, this.masterGain)
    })
  }

  /**
   * 播放错误音效（下降音阶，但仍然和谐）
   */
  playWrongSound(): void {
    if (!this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const chord = CHORD_PROGRESSION[this.currentChordIndex]

    // 下降琶音，但仍在调内
    const reversedChord = [...chord].reverse()
    reversedChord.forEach((noteIndex, i) => {
      const freq = C_MAJOR_SCALE[noteIndex] * 0.75
      const startTime = now + i * 0.08
      this.playTone(freq, startTime, 0.12, 0.15, this.masterGain)
    })
  }

  /**
   * 播放星星收集音效（闪亮音符）
   */
  playStarCollectedSound(): void {
    if (!this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime

    // 高音闪烁音符
    const sparkleFreqs = [523.25, 659.25, 783.99] // C5, E5, G5
    sparkleFreqs.forEach((freq, i) => {
      const startTime = now + i * 0.04
      this.playTone(freq, startTime, 0.3, 0.18, this.masterGain, 'sine')
    })
  }

  /**
   * 播放完成庆祝音效（胜利旋律）
   */
  playCelebrationSound(): void {
    if (!this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime

    // 胜利旋律：C-E-G-C（大三和弦上行）
    const victoryMelody = [
      { freq: 523.25, time: 0.0, duration: 0.2 },  // C5
      { freq: 659.25, time: 0.15, duration: 0.2 }, // E5
      { freq: 783.99, time: 0.3, duration: 0.2 },  // G5
      { freq: 1046.50, time: 0.45, duration: 0.5 },// C6 (长音)
    ]

    victoryMelody.forEach(note => {
      this.playTone(note.freq, now + note.time, note.duration, 0.3, this.masterGain!)
    })
  }

  /**
   * 播放单个音符（核心方法）
   */
  private playTone(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number,
    destination: AudioNode,
    waveType: OscillatorType = 'sine'
  ): void {
    if (!this.audioContext) return

    try {
      // 创建振荡器（音源）
      const osc = this.audioContext.createOscillator()
      osc.type = waveType
      osc.frequency.value = frequency

      // 创建音量包络（ADSR）
      const gain = this.audioContext.createGain()
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02) // Attack
      gain.gain.exponentialRampToValueAtTime(volume * 0.7, startTime + duration * 0.3) // Decay
      gain.gain.setValueAtTime(volume * 0.7, startTime + duration * 0.7) // Sustain
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration) // Release

      // 连接音频节点
      osc.connect(gain)
      gain.connect(destination)

      // 播放
      osc.start(startTime)
      osc.stop(startTime + duration)

      // 清理
      osc.onended = () => {
        gain.disconnect()
        osc.disconnect()
      }
    } catch (error) {
      console.error('Failed to play tone:', error)
    }
  }

  /**
   * 设置主音量
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * 销毁音频系统
   */
  destroy(): void {
    this.stop()

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
