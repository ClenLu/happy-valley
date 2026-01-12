import {
  type BalloonData,
  type BalloonColor,
  BALLOON_COLORS,
  DEFAULT_GAME_CONFIG,
} from '../../types'
import { createFlyToStarPath } from '../../utils/bezier'
import { flyToStarProgress, dodgeProgress as getDodgeProgress } from '../../utils/easing'
import type { Point } from '../../utils/bezier'

const BALLOON_COLORS_LIST: BalloonColor[] = ['coral', 'mint', 'sky', 'lemon', 'lavender', 'peach']

let balloonIdCounter = 0

/**
 * 气球实体类
 * 包含气球的所有属性和动画逻辑
 *
 * 状态流转:
 * - floating: 正常漂浮上升
 * - flyingToStar: 飞向星星变成星光
 * - dodging: 调皮躲避（点错时）
 * - done: 完成，可移除
 */
export class Balloon {
  data: BalloonData

  // 气球尺寸
  static readonly WIDTH = 80
  static readonly HEIGHT = 100

  // 飞行路径缓存
  private flyPath: { getPoint: (t: number) => Point } | null = null

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
      // 飞天动画参数
      flyProgress: 0,
      flyStartX: 0,
      flyStartY: 0,
      flyTargetX: 0,
      flyTargetY: 0,
      // 躲避动画参数
      dodgeProgress: 0,
      dodgeOffsetX: 0,
      dodgeOffsetY: 0,
      originalX: x,
    }
  }

  /**
   * 重置 ID 计数器
   */
  static resetIdCounter(): void {
    balloonIdCounter = 0
  }

  /**
   * 更新气球状态
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000  // 转换为秒

    switch (this.data.state) {
      case 'floating':
        this.updateFloating(dt)
        break
      case 'flyingToStar':
        this.updateFlying(deltaTime)
        break
      case 'dodging':
        this.updateDodging(deltaTime)
        break
    }
  }

  /**
   * 漂浮状态更新
   */
  private updateFloating(dt: number): void {
    // 上升
    this.data.y -= this.data.speed * 60 * dt

    // 左右摇摆 (正弦波)
    this.data.phase += dt * 2

    // 缓慢旋转 (跟随摇摆)
    this.data.rotation = Math.sin(this.data.phase) * 5  // ±5度
  }

  /**
   * 飞天动画更新
   */
  private updateFlying(deltaTime: number): void {
    const duration = DEFAULT_GAME_CONFIG.flyToStarDuration
    this.data.flyProgress += deltaTime / duration

    if (this.data.flyProgress >= 1) {
      this.data.flyProgress = 1
      this.data.state = 'done'
      return
    }

    // 使用贝塞尔曲线计算位置
    if (this.flyPath) {
      const point = this.flyPath.getPoint(this.data.flyProgress)
      this.data.x = point.x
      this.data.y = point.y
    }

    // 获取动画属性
    const props = flyToStarProgress(this.data.flyProgress)
    this.data.scale = props.scale

    // 旋转：沿曲线方向微微倾斜
    this.data.rotation = -15 + this.data.flyProgress * 30
  }

  /**
   * 躲避动画更新
   */
  private updateDodging(deltaTime: number): void {
    const duration = DEFAULT_GAME_CONFIG.dodgeDuration
    this.data.dodgeProgress += deltaTime / duration

    if (this.data.dodgeProgress >= 1) {
      this.data.dodgeProgress = 1
      // 躲避完成后恢复漂浮，但位置已偏移
      this.data.state = 'floating'
      return
    }

    // 获取躲避动画属性
    const props = getDodgeProgress(this.data.dodgeProgress)

    // 应用偏移
    this.data.dodgeOffsetX = props.offset * DEFAULT_GAME_CONFIG.dodgeDistance *
      (this.data.x > this.data.originalX ? 1 : -1) // 往远离原位置的方向躲

    // 轻微上下跳动
    this.data.dodgeOffsetY = -props.offset * 20 * (1 - props.offset)

    // 缩放和旋转
    this.data.scale = props.scale
    this.data.rotation = props.rotation * (this.data.dodgeOffsetX > 0 ? 1 : -1)
  }

  /**
   * 获取当前渲染位置（包含摇摆和躲避偏移）
   */
  getRenderX(): number {
    const swingOffset = this.data.state === 'floating'
      ? Math.sin(this.data.phase) * this.data.swingAmplitude
      : 0
    return this.data.x + swingOffset + this.data.dodgeOffsetX
  }

  /**
   * 获取当前渲染 Y 位置
   */
  getRenderY(): number {
    return this.data.y + this.data.dodgeOffsetY
  }

  /**
   * 触发飞向星星动画
   * @param targetX 目标星星 X 坐标
   * @param targetY 目标星星 Y 坐标
   */
  flyToStar(targetX: number, targetY: number): void {
    if (this.data.state !== 'floating') return

    this.data.state = 'flyingToStar'
    this.data.flyProgress = 0
    this.data.flyStartX = this.getRenderX()
    this.data.flyStartY = this.data.y
    this.data.flyTargetX = targetX
    this.data.flyTargetY = targetY

    // 创建飞行路径
    this.flyPath = createFlyToStarPath(
      { x: this.data.flyStartX, y: this.data.flyStartY },
      { x: targetX, y: targetY }
    )
  }

  /**
   * 触发躲避动画
   */
  dodge(): void {
    if (this.data.state !== 'floating') return

    this.data.state = 'dodging'
    this.data.dodgeProgress = 0
    this.data.originalX = this.data.x
  }

  /**
   * 检测点击碰撞（圆形检测，带触控优化）
   */
  hitTest(x: number, y: number): boolean {
    if (this.data.state !== 'floating') return false

    const renderX = this.getRenderX()
    const renderY = this.getRenderY()
    const centerX = renderX
    const centerY = renderY - Balloon.HEIGHT / 2

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
   * 是否正在飞天
   */
  isFlying(): boolean {
    return this.data.state === 'flyingToStar'
  }

  /**
   * 获取飞天进度（用于轨迹粒子）
   */
  getFlyProgress(): number {
    return this.data.flyProgress
  }

  /**
   * 获取飞天透明度
   */
  getFlyAlpha(): number {
    if (this.data.state !== 'flyingToStar') return 1
    const props = flyToStarProgress(this.data.flyProgress)
    return props.alpha
  }

  /**
   * 开始闪烁提示（用于正确答案提示）
   * 包含脉冲式放大 + 金色光晕效果
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

  /**
   * 更新闪烁状态，返回透明度和缩放比例
   * 脉冲式呼吸效果：1.0 → 1.3 → 1.0
   */
  updateFlash(deltaTime: number): { alpha: number; scale: number } {
    if (!this._isFlashing) {
      return { alpha: 1, scale: 1 }
    }

    this._flashTimer += deltaTime / 1000

    // 脉冲周期 0.6 秒
    const pulsePhase = (this._flashTimer % 0.6) / 0.6
    // 使用正弦波实现平滑的呼吸效果
    const pulse = Math.sin(pulsePhase * Math.PI)

    // 缩放: 1.0 → 1.3 → 1.0
    const scale = 1 + pulse * 0.3

    // 透明度轻微变化增加层次感
    const alpha = 0.85 + pulse * 0.15

    return { alpha, scale }
  }
}
