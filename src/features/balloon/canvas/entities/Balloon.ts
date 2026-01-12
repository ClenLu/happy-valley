import {
  type BalloonData,
  type BalloonColor,
  BALLOON_COLORS,
} from '../../types'

const BALLOON_COLORS_LIST: BalloonColor[] = ['coral', 'mint', 'sky', 'lemon', 'lavender', 'peach']

let balloonIdCounter = 0

/**
 * 气球实体类
 * 包含气球的所有属性和动画逻辑
 */
export class Balloon {
  data: BalloonData

  // 气球尺寸
  static readonly WIDTH = 80
  static readonly HEIGHT = 100

  constructor(letter: string, x: number, y: number, speed: number) {
    this.data = {
      id: ++balloonIdCounter,
      letter,
      x,
      y,
      color: BALLOON_COLORS_LIST[Math.floor(Math.random() * BALLOON_COLORS_LIST.length)],
      state: 'floating',
      phase: Math.random() * Math.PI * 2,  // 随机初始相位
      swingAmplitude: 15 + Math.random() * 10,  // 15-25px 摇摆幅度
      speed,
      scale: 1,
      rotation: 0,
      popProgress: 0,
    }
  }

  /**
   * 更新气球状态
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000  // 转换为秒

    if (this.data.state === 'floating') {
      // 上升
      this.data.y -= this.data.speed * 60 * dt

      // 左右摇摆 (正弦波)
      this.data.phase += dt * 2

      // 缓慢旋转 (跟随摇摆)
      this.data.rotation = Math.sin(this.data.phase) * 5  // ±5度

    } else if (this.data.state === 'popping') {
      // 爆破动画进度
      this.data.popProgress += dt * 4  // 0.25秒完成

      if (this.data.popProgress < 0.3) {
        // 先挤压
        this.data.scale = 1 - this.data.popProgress * 0.5
      } else if (this.data.popProgress < 0.6) {
        // 膨胀
        this.data.scale = 0.85 + (this.data.popProgress - 0.3) * 2
      } else {
        // 消失
        this.data.scale = Math.max(0, 1.45 - (this.data.popProgress - 0.6) * 4)
      }

      if (this.data.popProgress >= 1) {
        this.data.state = 'done'
      }
    }
  }

  /**
   * 获取当前渲染位置（包含摇摆偏移）
   */
  getRenderX(): number {
    return this.data.x + Math.sin(this.data.phase) * this.data.swingAmplitude
  }

  /**
   * 触发爆破
   */
  pop(): void {
    if (this.data.state === 'floating') {
      this.data.state = 'popping'
      this.data.popProgress = 0
    }
  }

  /**
   * 检测点击碰撞（圆形检测，带触控优化）
   */
  hitTest(x: number, y: number): boolean {
    if (this.data.state !== 'floating') return false

    const renderX = this.getRenderX()
    const centerX = renderX
    const centerY = this.data.y - Balloon.HEIGHT / 2

    // 触控优化：扩大 20px 检测区域
    const hitRadius = Balloon.WIDTH / 2 + 20
    const dx = x - centerX
    const dy = y - centerY

    return dx * dx + dy * dy <= hitRadius * hitRadius
  }

  /**
   * 检测是否飘出屏幕顶部
   */
  isOffScreen(): boolean {
    return this.data.y + Balloon.HEIGHT < 0
  }

  /**
   * 获取颜色值
   */
  getColors() {
    return BALLOON_COLORS[this.data.color]
  }

  /**
   * 是否已完成（可以移除）
   */
  isDone(): boolean {
    return this.data.state === 'done'
  }

  /**
   * 开始闪烁提示（用于正确答案提示）
   */
  private _flashTimer = 0
  private _isFlashing = false

  startFlash(): void {
    this._isFlashing = true
    this._flashTimer = 0
  }

  stopFlash(): void {
    this._isFlashing = false
  }

  isFlashing(): boolean {
    return this._isFlashing
  }

  updateFlash(deltaTime: number): number {
    if (!this._isFlashing) return 1
    this._flashTimer += deltaTime / 1000
    // 每 0.3 秒闪烁一次
    return Math.sin(this._flashTimer * 10) > 0 ? 1 : 0.5
  }
}
