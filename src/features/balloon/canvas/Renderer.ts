import { Balloon } from './entities/Balloon'
import { Star } from './entities/Star'
import type { Particle, Cloud } from '../types'

/**
 * Canvas 渲染器
 * 负责绘制夜空背景、星星、气球、粒子、云朵等游戏元素
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private dpr: number

  // 背景星星（装饰用）
  private bgStars: Array<{ x: number; y: number; size: number; twinkle: number }> = []

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')

    this.ctx = ctx
    this.dpr = window.devicePixelRatio || 1
    this.width = canvas.width / this.dpr
    this.height = canvas.height / this.dpr
  }

  /**
   * 更新画布尺寸
   */
  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.initBackgroundStars()
  }

  /**
   * 初始化背景装饰星星
   */
  private initBackgroundStars(): void {
    this.bgStars = []
    const count = Math.floor((this.width * this.height) / 8000) // 密度适中
    for (let i = 0; i < count; i++) {
      this.bgStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.6, // 主要在上半部分
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
      })
    }
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width * this.dpr, this.height * this.dpr)
  }

  /**
   * 绘制夜空背景渐变
   */
  drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * this.dpr)
    // 深蓝到紫色的夜空渐变
    gradient.addColorStop(0, '#0D1B2A')     // 深夜蓝
    gradient.addColorStop(0.3, '#1B263B')   // 深蓝
    gradient.addColorStop(0.6, '#2E3A59')   // 紫蓝
    gradient.addColorStop(1, '#4A3F6B')     // 淡紫

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width * this.dpr, this.height * this.dpr)

    // 绘制背景装饰星星
    this.drawBackgroundStars()
  }

  /**
   * 绘制背景装饰星星
   */
  private drawBackgroundStars(): void {
    const ctx = this.ctx
    const time = Date.now() / 1000

    for (const star of this.bgStars) {
      const twinkle = 0.3 + 0.7 * (Math.sin(time * 2 + star.twinkle) * 0.5 + 0.5)
      ctx.save()
      ctx.globalAlpha = twinkle * 0.6
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(
        star.x * this.dpr,
        star.y * this.dpr,
        star.size * this.dpr * twinkle,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.restore()
    }
  }

  /**
   * 绘制单个气球
   */
  drawBalloon(balloon: Balloon): void {
    if (balloon.data.state === 'done') return

    const ctx = this.ctx
    const { scale, rotation } = balloon.data
    const colors = balloon.getColors()
    const flash = balloon.updateFlash(16)  // 假设 60fps

    const x = balloon.getRenderX() * this.dpr
    const y = balloon.getRenderY() * this.dpr
    // 应用闪烁时的脉冲缩放
    const finalScale = scale * flash.scale
    const w = Balloon.WIDTH * this.dpr * finalScale
    const h = Balloon.HEIGHT * this.dpr * finalScale

    // 飞天时应用透明度
    const flyAlpha = balloon.getFlyAlpha()

    ctx.save()
    ctx.translate(x, y - h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.globalAlpha = flash.alpha * flyAlpha

    // 如果正在闪烁，先绘制金色光晕
    if (balloon.isFlashing()) {
      this.drawGoldenGlow(ctx, 0, 0, w, h, flash.scale)
    }

    // 绘制气球丝带
    this.drawRibbon(ctx, 0, h / 2, colors.stroke)

    // 绘制气球主体（椭圆形）
    this.drawBalloonBody(ctx, 0, 0, w, h, colors)

    // 绘制字母
    this.drawLetter(ctx, 0, 0, balloon.data.letter, w)

    ctx.restore()
  }

  /**
   * 绘制金色光晕效果
   */
  private drawGoldenGlow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    pulseScale: number
  ): void {
    const balloonH = h * 0.85
    const glowRadius = 15 * this.dpr * pulseScale

    // 外层光晕 - 大而柔和
    ctx.save()
    ctx.shadowColor = '#FFE066'
    ctx.shadowBlur = glowRadius * 2
    ctx.beginPath()
    ctx.ellipse(x, y, w / 2 + glowRadius, balloonH / 2 + glowRadius, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 224, 102, 0.3)'
    ctx.fill()
    ctx.restore()

    // 内层光晕 - 亮边框
    ctx.beginPath()
    ctx.ellipse(x, y, w / 2 + glowRadius * 0.5, balloonH / 2 + glowRadius * 0.5, 0, 0, Math.PI * 2)
    ctx.strokeStyle = '#FFE066'
    ctx.lineWidth = 4 * this.dpr * pulseScale
    ctx.stroke()
  }

  /**
   * 绘制气球主体
   */
  private drawBalloonBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    colors: { fill: string; stroke: string; highlight: string }
  ): void {
    // 气球形状 - 椭圆 + 底部小尖角
    ctx.beginPath()

    // 椭圆主体
    const balloonH = h * 0.85
    ctx.ellipse(x, y, w / 2, balloonH / 2, 0, 0, Math.PI * 2)

    // 渐变填充
    const gradient = ctx.createRadialGradient(
      x - w * 0.2, y - balloonH * 0.2, 0,
      x, y, w / 2
    )
    gradient.addColorStop(0, colors.highlight)
    gradient.addColorStop(0.5, colors.fill)
    gradient.addColorStop(1, colors.stroke)

    ctx.fillStyle = gradient
    ctx.fill()

    // 边框
    ctx.strokeStyle = colors.stroke
    ctx.lineWidth = 2 * this.dpr
    ctx.stroke()

    // 底部小三角（绑绳结）
    const knotY = balloonH / 2
    ctx.beginPath()
    ctx.moveTo(x - w * 0.08, knotY)
    ctx.lineTo(x, knotY + h * 0.08)
    ctx.lineTo(x + w * 0.08, knotY)
    ctx.closePath()
    ctx.fillStyle = colors.stroke
    ctx.fill()

    // 高光
    ctx.beginPath()
    ctx.ellipse(x - w * 0.2, y - balloonH * 0.25, w * 0.12, w * 0.08, -0.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fill()
  }

  /**
   * 绘制丝带
   */
  private drawRibbon(ctx: CanvasRenderingContext2D, x: number, startY: number, color: string): void {
    const ribbonLength = 40 * this.dpr

    ctx.beginPath()
    ctx.moveTo(x, startY)

    // 波浪形丝带
    const segments = 4
    for (let i = 1; i <= segments; i++) {
      const offsetX = Math.sin(i * 0.8) * 8 * this.dpr
      const segY = startY + (ribbonLength / segments) * i
      ctx.quadraticCurveTo(x + offsetX, segY - 5 * this.dpr, x + offsetX * 0.5, segY)
    }

    ctx.strokeStyle = color
    ctx.lineWidth = 2 * this.dpr
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  /**
   * 绘制字母
   */
  private drawLetter(ctx: CanvasRenderingContext2D, x: number, y: number, letter: string, balloonWidth: number): void {
    const fontSize = balloonWidth * 0.5

    // 使用系统默认字体，不使用特殊字体
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 文字阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.fillText(letter, x + 2 * this.dpr, y + 2 * this.dpr)

    // 主文字（白色）
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(letter, x, y)
  }

  /**
   * 绘制所有气球
   */
  drawBalloons(balloons: Balloon[]): void {
    // 按 y 坐标排序，远的先画
    const sorted = [...balloons].sort((a, b) => a.data.y - b.data.y)
    for (const balloon of sorted) {
      this.drawBalloon(balloon)
    }
  }

  /**
   * 绘制星座星星
   */
  drawConstellationStar(star: Star): void {
    if (!star.isVisible()) return

    const ctx = this.ctx
    const pos = star.getScreenPosition(this.width, this.height)
    const props = star.getRenderProps()

    const x = pos.x * this.dpr
    const y = pos.y * this.dpr
    const size = Star.SIZE * this.dpr * props.scale

    ctx.save()

    // 绘制光晕
    if (props.glowAlpha > 0) {
      const glowSize = Star.GLOW_SIZE * this.dpr * props.scale
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
      gradient.addColorStop(0, `rgba(255, 230, 150, ${props.glowAlpha})`)
      gradient.addColorStop(0.5, `rgba(255, 200, 100, ${props.glowAlpha * 0.5})`)
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, glowSize, 0, Math.PI * 2)
      ctx.fill()
    }

    // 绘制星星本体
    ctx.globalAlpha = props.alpha
    this.drawStarShape(ctx, x, y, size, '#FFF8DC')

    ctx.restore()
  }

  /**
   * 绘制星星形状
   */
  private drawStarShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    const spikes = 5
    const outerRadius = size
    const innerRadius = size * 0.5

    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / spikes - Math.PI / 2
      const px = x + Math.cos(angle) * radius
      const py = y + Math.sin(angle) * radius
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  /**
   * 绘制所有星座星星
   */
  drawConstellationStars(stars: Star[]): void {
    for (const star of stars) {
      this.drawConstellationStar(star)
    }
  }

  /**
   * 绘制星座连线
   */
  drawConstellationConnections(connections: Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    progress: number
  }>): void {
    const ctx = this.ctx

    for (const conn of connections) {
      const fromX = conn.from.x * this.dpr
      const fromY = conn.from.y * this.dpr
      const toX = conn.to.x * this.dpr
      const toY = conn.to.y * this.dpr

      // 计算实际绘制的终点（根据进度）
      const currentX = fromX + (toX - fromX) * conn.progress
      const currentY = fromY + (toY - fromY) * conn.progress

      ctx.save()
      ctx.strokeStyle = 'rgba(255, 230, 180, 0.6)'
      ctx.lineWidth = 2 * this.dpr
      ctx.lineCap = 'round'

      // 发光效果
      ctx.shadowColor = '#FFE4B0'
      ctx.shadowBlur = 8 * this.dpr

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()

      ctx.restore()
    }
  }

  /**
   * 绘制飞行轨迹（彩虹尾迹）
   */
  drawFlyingTrail(balloon: Balloon): void {
    if (!balloon.isFlying()) return

    const ctx = this.ctx
    const progress = balloon.getFlyProgress()
    if (progress < 0.05) return // 刚开始不画

    // 轨迹颜色（彩虹渐变）
    const colors = ['#FF6B6B', '#FFE066', '#4ECDC4', '#45B7D1', '#96E6A1']
    const trailLength = 30

    const x = balloon.getRenderX() * this.dpr
    const y = balloon.getRenderY() * this.dpr

    ctx.save()
    ctx.globalAlpha = 0.6 * (1 - progress * 0.5)

    // 绘制多条彩色轨迹
    for (let i = 0; i < 5; i++) {
      const offsetAngle = (i - 2) * 0.2
      const length = trailLength * this.dpr * (1 - i * 0.1)

      ctx.strokeStyle = colors[i]
      ctx.lineWidth = (4 - i * 0.5) * this.dpr
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(
        x + Math.cos(Math.PI - offsetAngle) * length,
        y + Math.sin(Math.PI - offsetAngle) * length * 0.5
      )
      ctx.stroke()
    }

    ctx.restore()
  }

  /**
   * 绘制粒子
   */
  drawParticles(particles: Particle[]): void {
    const ctx = this.ctx

    for (const p of particles) {
      const alpha = p.life / p.maxLife
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(p.x * this.dpr, p.y * this.dpr)
      ctx.rotate(p.rotation)

      if (p.type === 'star') {
        this.drawStarShape(ctx, 0, 0, p.size * this.dpr, p.color)
      } else if (p.type === 'stardust') {
        this.drawStardust(ctx, 0, 0, p.size * this.dpr, p.color)
      } else if (p.type === 'trail') {
        this.drawTrailParticle(ctx, 0, 0, p.size * this.dpr, p.color, p.alpha || alpha)
      } else {
        this.drawConfetti(ctx, 0, 0, p.size * this.dpr, p.color)
      }

      ctx.restore()
    }
  }

  /**
   * 绘制星尘粒子
   */
  private drawStardust(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制轨迹粒子
   */
  private drawTrailParticle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number): void {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制彩纸
   */
  private drawConfetti(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    ctx.fillStyle = color
    ctx.fillRect(x - size / 2, y - size / 4, size, size / 2)
  }

  /**
   * 绘制目标字母提示
   */
  drawTargetHint(letter: string, y: number): void {
    const ctx = this.ctx
    const x = this.width * this.dpr / 2

    ctx.save()
    ctx.font = `bold ${24 * this.dpr}px "Nunito", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4 * this.dpr
    ctx.fillText(`找到字母 ${letter}!`, x, y * this.dpr)
    ctx.restore()
  }

  /**
   * 绘制云朵
   */
  drawClouds(clouds: Cloud[]): void {
    const ctx = this.ctx

    for (const cloud of clouds) {
      ctx.save()
      ctx.globalAlpha = cloud.opacity * 0.5 // 夜空中云朵更淡

      const x = cloud.x * this.dpr
      const y = cloud.y * this.dpr
      const baseSize = 30 * cloud.size * this.dpr

      // 使用多个圆形组合成云朵形状，颜色偏深蓝
      ctx.fillStyle = '#2E3A59'
      ctx.beginPath()

      // 左边小圆
      ctx.arc(x - baseSize * 0.6, y, baseSize * 0.5, 0, Math.PI * 2)
      // 中间大圆
      ctx.arc(x, y - baseSize * 0.2, baseSize * 0.7, 0, Math.PI * 2)
      // 右边小圆
      ctx.arc(x + baseSize * 0.6, y, baseSize * 0.5, 0, Math.PI * 2)
      // 底部连接
      ctx.arc(x, y + baseSize * 0.1, baseSize * 0.5, 0, Math.PI * 2)

      ctx.fill()
      ctx.restore()
    }
  }
}
