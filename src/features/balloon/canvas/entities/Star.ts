import type { Star as StarData } from '../../types'
import { easeOutElastic, easeOut, breathe } from '../../utils/easing'

let starIdCounter = 0

/**
 * 星星实体类
 * 管理星座中的单个星星状态和动画
 */
export class Star {
  data: StarData

  // 星星视觉尺寸
  static readonly SIZE = 24
  static readonly GLOW_SIZE = 40

  constructor(letter: string, position: { x: number; y: number }) {
    this.data = {
      id: ++starIdCounter,
      letter,
      position,
      state: 'empty',
      appearProgress: 0,
      twinklePhase: Math.random() * Math.PI * 2, // 随机初始相位
    }
  }

  /**
   * 重置 ID 计数器（新游戏时调用）
   */
  static resetIdCounter(): void {
    starIdCounter = 0
  }

  /**
   * 更新星星状态
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000

    // 闪烁相位持续更新
    this.data.twinklePhase += dt * 3

    if (this.data.state === 'appearing') {
      // 出现动画进度
      this.data.appearProgress += dt * 2 // 0.5秒完成
      if (this.data.appearProgress >= 1) {
        this.data.appearProgress = 1
        this.data.state = 'lit'
      }
    }
  }

  /**
   * 触发星星出现动画
   */
  appear(): void {
    if (this.data.state === 'empty') {
      this.data.state = 'appearing'
      this.data.appearProgress = 0
    }
  }

  /**
   * 标记为已连线
   */
  connect(): void {
    this.data.state = 'connected'
  }

  /**
   * 获取渲染属性
   * 根据当前状态计算缩放、透明度、光晕等
   */
  getRenderProps(): {
    scale: number
    alpha: number
    glowAlpha: number
    twinkle: number
  } {
    switch (this.data.state) {
      case 'empty':
        return {
          scale: 0,
          alpha: 0,
          glowAlpha: 0,
          twinkle: 0,
        }

      case 'appearing': {
        // 弹性出现效果
        const progress = this.data.appearProgress
        const scale = easeOutElastic(progress)
        const alpha = easeOut(Math.min(progress * 2, 1))
        return {
          scale,
          alpha,
          glowAlpha: alpha * 0.5,
          twinkle: 0,
        }
      }

      case 'lit': {
        // 呼吸闪烁效果
        const twinkle = breathe(this.data.twinklePhase / (Math.PI * 2), 1)
        return {
          scale: 1 + twinkle * 0.1, // 轻微脉冲
          alpha: 0.9 + twinkle * 0.1,
          glowAlpha: 0.4 + twinkle * 0.3,
          twinkle,
        }
      }

      case 'connected': {
        // 连线后更亮更稳定
        const twinkle = breathe(this.data.twinklePhase / (Math.PI * 2), 0.5)
        return {
          scale: 1.2,
          alpha: 1,
          glowAlpha: 0.6 + twinkle * 0.2,
          twinkle,
        }
      }

      default:
        return {
          scale: 1,
          alpha: 1,
          glowAlpha: 0.5,
          twinkle: 0,
        }
    }
  }

  /**
   * 获取屏幕坐标（基于画布尺寸）
   */
  getScreenPosition(canvasWidth: number, canvasHeight: number): { x: number; y: number } {
    return {
      x: this.data.position.x * canvasWidth,
      y: this.data.position.y * canvasHeight,
    }
  }

  /**
   * 是否可见（用于渲染判断）
   */
  isVisible(): boolean {
    return this.data.state !== 'empty'
  }

  /**
   * 是否已点亮（用于游戏逻辑判断）
   */
  isLit(): boolean {
    return this.data.state === 'lit' || this.data.state === 'connected'
  }
}
