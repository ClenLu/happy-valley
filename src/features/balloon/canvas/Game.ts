import { Balloon } from './entities/Balloon'
import { Renderer } from './Renderer'
import { ParticleSystem } from './systems/ParticleSystem'
import { getRandomLetter, getRandomLetters } from '../utils/letters'
import type { GameState, DifficultyConfig } from '../types'

// 难度配置
const DIFFICULTY: Record<1 | 2 | 3 | 4, DifficultyConfig> = {
  1: { balloonCount: 2, baseSpeed: 0.5, spawnInterval: 2000 },
  2: { balloonCount: 3, baseSpeed: 0.6, spawnInterval: 1800 },
  3: { balloonCount: 4, baseSpeed: 0.7, spawnInterval: 1600 },
  4: { balloonCount: 5, baseSpeed: 0.8, spawnInterval: 1400 },
}

// 升级所需的连续答对次数
const LEVEL_UP_THRESHOLDS = [3, 5, 8]

export interface GameCallbacks {
  onCorrect: (letter: string) => void
  onWrong: (tappedLetter: string, correctLetter: string) => void
  onMissed: (letter: string) => void
  onLevelUp: (newLevel: number) => void
  onNewRound: (targetLetter: string) => void
}

/**
 * 游戏主控制器
 */
export class Game {
  private canvas: HTMLCanvasElement
  private renderer: Renderer
  private particleSystem: ParticleSystem
  private callbacks: GameCallbacks

  private state: GameState = {
    phase: 'ready',
    targetLetter: '',
    balloons: [],
    difficulty: 1,
    consecutiveCorrect: 0,
    score: 0,
  }

  private balloons: Balloon[] = []
  private lastTime = 0
  private animationId: number | null = null
  private width = 0
  private height = 0
  private dpr = 1

  // 防误触：生成后一段时间内不响应点击
  private spawnProtectionTime = 0
  private readonly SPAWN_PROTECTION_MS = 300

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas
    this.renderer = new Renderer(canvas)
    this.particleSystem = new ParticleSystem()
    this.callbacks = callbacks
    this.dpr = window.devicePixelRatio || 1
  }

  /**
   * 初始化画布尺寸
   */
  resize(width: number, height: number): void {
    this.width = width
    this.height = height

    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    this.renderer.resize(width, height)
  }

  /**
   * 开始游戏
   */
  start(): void {
    this.state.phase = 'playing'
    this.state.difficulty = 1
    this.state.consecutiveCorrect = 0
    this.state.score = 0
    this.balloons = []
    this.particleSystem.clear()

    this.startNewRound()
    this.lastTime = performance.now()
    this.gameLoop()
  }

  /**
   * 停止游戏
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.state.phase = 'ready'
  }

  /**
   * 开始新一轮
   */
  private startNewRound(): void {
    // 清除旧气球
    this.balloons = this.balloons.filter(b => b.data.state === 'popping')

    // 选择新的目标字母
    this.state.targetLetter = getRandomLetter()

    // 获取难度配置
    const config = DIFFICULTY[this.state.difficulty]

    // 生成气球字母（确保包含目标字母）
    const letters = getRandomLetters(config.balloonCount, this.state.targetLetter)

    // 计算气球位置（均匀分布）
    const margin = 60
    const availableWidth = this.width - margin * 2
    const spacing = availableWidth / (letters.length + 1)

    for (let i = 0; i < letters.length; i++) {
      const x = margin + spacing * (i + 1)
      const y = this.height + 50 + Math.random() * 30  // 从屏幕底部下方开始
      const speed = config.baseSpeed + Math.random() * 0.2

      this.balloons.push(new Balloon(letters[i], x, y, speed))
    }

    // 设置防误触保护
    this.spawnProtectionTime = this.SPAWN_PROTECTION_MS

    // 通知新一轮开始
    this.callbacks.onNewRound(this.state.targetLetter)
  }

  /**
   * 游戏主循环
   */
  private gameLoop = (): void => {
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    this.animationId = requestAnimationFrame(this.gameLoop)
  }

  /**
   * 更新游戏状态
   */
  private update(deltaTime: number): void {
    if (this.state.phase !== 'playing' && this.state.phase !== 'celebrating') return

    // 更新防误触计时
    if (this.spawnProtectionTime > 0) {
      this.spawnProtectionTime -= deltaTime
    }

    // 更新气球
    for (const balloon of this.balloons) {
      balloon.update(deltaTime)
    }

    // 更新粒子
    this.particleSystem.update(deltaTime)

    // 检测目标气球是否飘出屏幕
    if (this.state.phase === 'playing') {
      const targetBalloon = this.balloons.find(
        b => b.data.letter === this.state.targetLetter && b.data.state === 'floating'
      )

      if (targetBalloon && targetBalloon.isOffScreen()) {
        // 目标飘走了
        this.callbacks.onMissed(this.state.targetLetter)
        this.startNewRound()
      }
    }

    // 移除已完成的气球
    this.balloons = this.balloons.filter(b => !b.isDone())
  }

  /**
   * 渲染
   */
  private render(): void {
    this.renderer.clear()
    this.renderer.drawBackground()
    this.renderer.drawBalloons(this.balloons)
    this.renderer.drawParticles(this.particleSystem.getParticles())
    // 目标字母提示已移至 React 组件
  }

  /**
   * 处理点击/触摸事件
   */
  handleTap(clientX: number, clientY: number): void {
    if (this.state.phase !== 'playing') return
    if (this.spawnProtectionTime > 0) return  // 防误触保护期

    // 转换为画布坐标
    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    // 检测点击的气球（从上往下检测，优先响应靠近用户的）
    const sortedBalloons = [...this.balloons]
      .filter(b => b.data.state === 'floating')
      .sort((a, b) => b.data.y - a.data.y)

    for (const balloon of sortedBalloons) {
      if (balloon.hitTest(x, y)) {
        this.handleBalloonTap(balloon)
        return
      }
    }
  }

  /**
   * 处理气球点击
   */
  private handleBalloonTap(balloon: Balloon): void {
    const isCorrect = balloon.data.letter === this.state.targetLetter

    if (isCorrect) {
      // 答对了 - 爆破气球
      balloon.pop()
      this.particleSystem.createExplosion(
        balloon.getRenderX(),
        balloon.data.y - Balloon.HEIGHT / 2,
        balloon.data.color,
        true
      )

      this.state.consecutiveCorrect++
      this.state.score++

      // 停止其他气球的闪烁
      this.balloons.forEach(b => b.stopFlash())

      // 检查是否升级
      this.checkLevelUp()

      this.callbacks.onCorrect(balloon.data.letter)

      // 延迟后开始下一轮
      setTimeout(() => {
        this.startNewRound()
      }, 800)
    } else {
      // 答错了 - 不爆破，只播放当前气球的字母
      this.callbacks.onWrong(balloon.data.letter, this.state.targetLetter)

      // 让正确的气球闪烁提示
      const correctBalloon = this.balloons.find(
        b => b.data.letter === this.state.targetLetter && b.data.state === 'floating'
      )
      if (correctBalloon) {
        correctBalloon.startFlash()
        // 2秒后停止闪烁
        setTimeout(() => correctBalloon.stopFlash(), 2000)
      }
    }
  }

  /**
   * 检查是否升级
   */
  private checkLevelUp(): void {
    const currentLevel = this.state.difficulty
    if (currentLevel >= 4) return

    const threshold = LEVEL_UP_THRESHOLDS[currentLevel - 1]
    if (this.state.consecutiveCorrect >= threshold) {
      this.state.difficulty = (currentLevel + 1) as 1 | 2 | 3 | 4
      this.callbacks.onLevelUp(this.state.difficulty)
    }
  }

  /**
   * 获取当前状态
   */
  getState(): GameState {
    return { ...this.state }
  }
}
