import { Balloon } from './entities/Balloon'
import { Renderer } from './Renderer'
import { ParticleSystem } from './systems/ParticleSystem'
import { ConstellationSystem } from './systems/ConstellationSystem'
import { MusicSystem } from '../audio/MusicSystem'
import { getRandomLetter, getRandomLetters } from '../utils/letters'
import type { GameState, GamePhase, Cloud } from '../types'

// 游戏配置
const CONFIG = {
  totalStars: 10,
  balloonCountRange: [2, 4] as [number, number],
  baseBalloonSpeed: 0.3,
  flyToStarDuration: 2000,
  dodgeDuration: 600,
  dodgeDistance: 40,
}

export interface GameCallbacks {
  onCorrect: (letter: string) => void
  onWrong: (tappedLetter: string, correctLetter: string) => void
  onMissed: (letter: string) => void
  onStarCollected: (starId: number, totalCollected: number) => void
  onNewRound: (targetLetter: string, round: number) => void
  onPhaseChange: (phase: GamePhase) => void
  onGameComplete: () => void
}

/**
 * 星空许愿 - 游戏主控制器
 *
 * 游戏流程:
 * 1. idle -> intro (开场动画)
 * 2. intro -> playing (开始游戏)
 * 3. playing -> flying (点对气球，气球飞向星星)
 * 4. flying -> playing (继续下一轮)
 * 5. 最后一颗星星 -> celebrating -> ending
 */
export class Game {
  private canvas: HTMLCanvasElement
  private renderer: Renderer
  private particleSystem: ParticleSystem
  private constellationSystem: ConstellationSystem
  private musicSystem: MusicSystem
  private callbacks: GameCallbacks

  private state: GameState = {
    phase: 'idle',
    targetLetter: '',
    balloons: [],
    currentRound: 0,
    collectedStars: 0,
    totalStars: CONFIG.totalStars,
  }

  private balloons: Balloon[] = []
  private clouds: Cloud[] = []
  private targetLetters: string[] = [] // 10个目标字母
  private lastTime = 0
  private animationId: number | null = null
  private width = 0
  private height = 0
  private dpr = 1

  // 防误触：生成后一段时间内不响应点击
  private spawnProtectionTime = 0
  private readonly SPAWN_PROTECTION_MS = 300

  // 飞天中的气球
  private flyingBalloon: Balloon | null = null

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas
    this.renderer = new Renderer(canvas)
    this.particleSystem = new ParticleSystem()
    this.constellationSystem = new ConstellationSystem()
    this.musicSystem = new MusicSystem()
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
    this.constellationSystem.setCanvasSize(width, height)

    // 初始化云朵（只在第一次 resize 时）
    if (this.clouds.length === 0) {
      this.initClouds()
    }
  }

  /**
   * 初始化背景云朵
   */
  private initClouds(): void {
    // 创建 3-4 朵云，分布在屏幕上半部分
    const cloudCount = 3 + Math.floor(Math.random() * 2)
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: this.height * (0.1 + Math.random() * 0.25),
        size: 0.6 + Math.random() * 0.6,
        speed: 8 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.2,
      })
    }
  }

  /**
   * 开始游戏
   */
  start(): void {
    this.setPhase('playing') // TODO: 后续添加 intro 动画

    // 重置状态
    Balloon.resetIdCounter()
    this.state.currentRound = 0
    this.state.collectedStars = 0
    this.balloons = []
    this.flyingBalloon = null
    this.particleSystem.clear()

    // 生成 10 个随机目标字母
    this.targetLetters = []
    for (let i = 0; i < CONFIG.totalStars; i++) {
      this.targetLetters.push(getRandomLetter())
    }

    // 初始化星座
    this.constellationSystem.initialize(this.targetLetters)

    // 启动音乐系统
    this.musicSystem.start()

    // 开始第一轮
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
    this.musicSystem.stop()
    this.setPhase('idle')
  }

  /**
   * 设置游戏阶段
   */
  private setPhase(phase: GamePhase): void {
    this.state.phase = phase
    this.callbacks.onPhaseChange(phase)
  }

  /**
   * 开始新一轮
   */
  private startNewRound(): void {
    if (this.state.currentRound >= CONFIG.totalStars) {
      // 所有星星收集完成
      this.triggerEnding()
      return
    }

    // 清除已完成的气球
    this.balloons = this.balloons.filter(b => b.isFlying())

    // 获取当前轮次的目标字母
    this.state.targetLetter = this.targetLetters[this.state.currentRound]
    this.state.currentRound++

    // 生成气球
    const balloonCount = CONFIG.balloonCountRange[0] +
      Math.floor(Math.random() * (CONFIG.balloonCountRange[1] - CONFIG.balloonCountRange[0] + 1))

    const letters = getRandomLetters(balloonCount, this.state.targetLetter)

    // 计算气球位置（均匀分布）
    const margin = 60
    const availableWidth = this.width - margin * 2
    const spacing = availableWidth / (letters.length + 1)

    for (let i = 0; i < letters.length; i++) {
      const x = margin + spacing * (i + 1)
      const y = this.height + 50 + Math.random() * 30
      const speed = CONFIG.baseBalloonSpeed + Math.random() * 0.15

      this.balloons.push(new Balloon(letters[i], x, y, speed))
    }

    // 设置防误触保护
    this.spawnProtectionTime = this.SPAWN_PROTECTION_MS

    // 通知新一轮开始
    this.callbacks.onNewRound(this.state.targetLetter, this.state.currentRound)
  }

  /**
   * 触发结局
   */
  private triggerEnding(): void {
    this.setPhase('celebrating')

    // 开始绘制星座连线
    this.constellationSystem.startDrawingConnections()

    // 创建庆祝粒子
    this.particleSystem.createLevelUpCelebration(this.width / 2, this.height / 3)

    // 播放庆祝音效
    this.musicSystem.playCelebrationSound()

    // 延迟后触发结束
    setTimeout(() => {
      this.setPhase('ending')
      this.callbacks.onGameComplete()
    }, 3000)
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
    // 云朵始终更新
    this.updateClouds(deltaTime)

    // 星座系统始终更新（闪烁动画）
    this.constellationSystem.update(deltaTime)

    // 粒子系统始终更新
    this.particleSystem.update(deltaTime)

    if (this.state.phase !== 'playing' && this.state.phase !== 'flying' && this.state.phase !== 'celebrating') {
      return
    }

    // 更新防误触计时
    if (this.spawnProtectionTime > 0) {
      this.spawnProtectionTime -= deltaTime
    }

    // 更新气球
    for (const balloon of this.balloons) {
      balloon.update(deltaTime)
    }

    // 检查飞天气球是否完成
    if (this.state.phase === 'flying' && this.flyingBalloon) {
      if (this.flyingBalloon.isDone()) {
        // 点亮对应的星星
        const starIndex = this.state.collectedStars
        this.constellationSystem.lightStar(starIndex)
        this.state.collectedStars++

        // 创建星星出现粒子效果
        const starPos = this.constellationSystem.getStarPosition(starIndex)
        if (starPos) {
          this.particleSystem.createStarAppearEffect(starPos.x, starPos.y)
        }

        // 播放星星收集音效
        this.musicSystem.playStarCollectedSound()

        this.callbacks.onStarCollected(starIndex + 1, this.state.collectedStars)

        this.flyingBalloon = null
        this.setPhase('playing')

        // 开始下一轮
        setTimeout(() => {
          this.startNewRound()
        }, 500)
      }
    }

    // 检测目标气球是否飘出屏幕
    if (this.state.phase === 'playing') {
      const targetBalloon = this.balloons.find(
        b => b.data.letter === this.state.targetLetter && b.data.state === 'floating'
      )

      if (targetBalloon && targetBalloon.isOffScreen()) {
        this.callbacks.onMissed(this.state.targetLetter)
        this.startNewRound()
      }
    }

    // 移除已完成的气球
    this.balloons = this.balloons.filter(b => !b.isDone())
  }

  /**
   * 更新云朵位置
   */
  private updateClouds(deltaTime: number): void {
    const dt = deltaTime / 1000

    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt

      if (cloud.x > this.width + 60) {
        cloud.x = -60
        cloud.y = this.height * (0.1 + Math.random() * 0.25)
      }
    }
  }

  /**
   * 渲染
   */
  private render(): void {
    this.renderer.clear()
    this.renderer.drawBackground()
    this.renderer.drawClouds(this.clouds)

    // 绘制星座（星星和连线）
    this.renderer.drawConstellationStars(this.constellationSystem.getStars())
    this.renderer.drawConstellationConnections(this.constellationSystem.getConnectionsForRender())

    // 绘制飞行轨迹
    for (const balloon of this.balloons) {
      if (balloon.isFlying()) {
        this.renderer.drawFlyingTrail(balloon)
      }
    }

    // 绘制气球
    this.renderer.drawBalloons(this.balloons)

    // 绘制粒子
    this.renderer.drawParticles(this.particleSystem.getParticles())
  }

  /**
   * 处理点击/触摸事件
   */
  handleTap(clientX: number, clientY: number): void {
    if (this.state.phase !== 'playing') return
    if (this.spawnProtectionTime > 0) return

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

    // 即使没点中气球，也播放音符（让孩子感觉"我在创造音乐"）
    this.musicSystem.playClickNote()
  }

  /**
   * 处理气球点击
   */
  private handleBalloonTap(balloon: Balloon): void {
    const isCorrect = balloon.data.letter === this.state.targetLetter

    // 播放点击音符（无论对错，都是和谐的）
    this.musicSystem.playClickNote()

    if (isCorrect) {
      // 答对了 - 气球飞向星星
      const starIndex = this.state.collectedStars
      const starPos = this.constellationSystem.getStarPosition(starIndex)

      if (starPos) {
        balloon.flyToStar(starPos.x, starPos.y)
        this.flyingBalloon = balloon
        this.setPhase('flying')

        // 停止其他气球的闪烁
        this.balloons.forEach(b => b.stopFlash())

        // 播放正确音效
        this.musicSystem.playCorrectSound()

        this.callbacks.onCorrect(balloon.data.letter)
      }
    } else {
      // 答错了 - 气球调皮躲避
      balloon.dodge()

      // 播放错误音效（仍然和谐）
      this.musicSystem.playWrongSound()

      this.callbacks.onWrong(balloon.data.letter, this.state.targetLetter)

      // 让正确的气球闪烁提示
      const correctBalloon = this.balloons.find(
        b => b.data.letter === this.state.targetLetter && b.data.state === 'floating'
      )
      if (correctBalloon) {
        correctBalloon.startFlash()
        setTimeout(() => correctBalloon.stopFlash(), 2000)
      }
    }
  }

  /**
   * 获取当前状态
   */
  getState(): GameState {
    return { ...this.state }
  }

  /**
   * 获取星座进度
   */
  getConstellationProgress(): { collected: number; total: number } {
    return {
      collected: this.constellationSystem.getLitCount(),
      total: this.constellationSystem.getTotalCount(),
    }
  }
}
