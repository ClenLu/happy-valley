import { Balloon } from './entities/Balloon'
import type { Particle } from '../types'

/**
 * Canvas 渲染器
 * 负责绘制气球、粒子等游戏元素
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private dpr: number

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
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width * this.dpr, this.height * this.dpr)
  }

  /**
   * 绘制背景渐变
   */
  drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * this.dpr)
    gradient.addColorStop(0, '#F0F8FF')    // 天空蓝
    gradient.addColorStop(0.5, '#FFFBF5')  // 奶油色
    gradient.addColorStop(1, '#FFF8F0')    // 暖色

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width * this.dpr, this.height * this.dpr)
  }

  /**
   * 绘制单个气球
   */
  drawBalloon(balloon: Balloon): void {
    if (balloon.data.state === 'done') return

    const ctx = this.ctx
    const { scale, rotation } = balloon.data
    const colors = balloon.getColors()
    const flashAlpha = balloon.updateFlash(16)  // 假设 60fps

    const x = balloon.getRenderX() * this.dpr
    const y = balloon.data.y * this.dpr
    const w = Balloon.WIDTH * this.dpr * scale
    const h = Balloon.HEIGHT * this.dpr * scale

    ctx.save()
    ctx.translate(x, y - h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.globalAlpha = flashAlpha

    // 绘制气球丝带
    this.drawRibbon(ctx, 0, h / 2, colors.stroke)

    // 绘制气球主体（椭圆形）
    this.drawBalloonBody(ctx, 0, 0, w, h, colors)

    // 绘制字母
    this.drawLetter(ctx, 0, 0, balloon.data.letter, w)

    ctx.restore()
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

    ctx.font = `bold ${fontSize}px "Nunito", "Comic Sans MS", cursive`
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
        this.drawStar(ctx, 0, 0, p.size * this.dpr, p.color)
      } else {
        this.drawConfetti(ctx, 0, 0, p.size * this.dpr, p.color)
      }

      ctx.restore()
    }
  }

  /**
   * 绘制星星
   */
  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
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
    ctx.fillStyle = '#4A4A4A'
    ctx.fillText(`找到字母 ${letter}!`, x, y * this.dpr)
    ctx.restore()
  }
}
