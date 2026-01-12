import { Star } from '../entities/Star'
import { HEART_CONSTELLATION_LAYOUT, HEART_CONNECTIONS } from '../../types'
import { easeInOut } from '../../utils/easing'

/**
 * 星座系统
 * 管理所有星星的生成、状态、连线动画
 */
export class ConstellationSystem {
  private stars: Star[] = []
  private connections: [number, number][] = HEART_CONNECTIONS
  private drawProgress = 0 // 连线绘制进度 0-1
  private isDrawingConnections = false

  // 画布尺寸（用于坐标转换）
  private canvasWidth = 0
  private canvasHeight = 0

  /**
   * 初始化星座
   * @param letters 10个目标字母（按顺序对应星星位置）
   */
  initialize(letters: string[]): void {
    Star.resetIdCounter()
    this.stars = []
    this.drawProgress = 0
    this.isDrawingConnections = false

    // 根据心形布局创建星星
    for (let i = 0; i < HEART_CONSTELLATION_LAYOUT.length; i++) {
      const position = HEART_CONSTELLATION_LAYOUT[i]
      const letter = letters[i] || ''
      this.stars.push(new Star(letter, position))
    }
  }

  /**
   * 设置画布尺寸
   */
  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width
    this.canvasHeight = height
  }

  /**
   * 更新所有星星
   */
  update(deltaTime: number): void {
    for (const star of this.stars) {
      star.update(deltaTime)
    }

    // 更新连线绘制动画
    if (this.isDrawingConnections) {
      this.drawProgress += deltaTime / 1000 * 0.5 // 2秒绘制完成
      if (this.drawProgress >= 1) {
        this.drawProgress = 1
        this.isDrawingConnections = false
      }
    }
  }

  /**
   * 点亮指定序号的星星
   * @param index 星星序号 (0-9)
   */
  lightStar(index: number): void {
    if (index >= 0 && index < this.stars.length) {
      this.stars[index].appear()
    }
  }

  /**
   * 获取指定序号星星的屏幕位置
   * @param index 星星序号 (0-9)
   */
  getStarPosition(index: number): { x: number; y: number } | null {
    if (index >= 0 && index < this.stars.length) {
      return this.stars[index].getScreenPosition(this.canvasWidth, this.canvasHeight)
    }
    return null
  }

  /**
   * 获取下一个待点亮的星星序号
   */
  getNextStarIndex(): number {
    for (let i = 0; i < this.stars.length; i++) {
      if (this.stars[i].data.state === 'empty') {
        return i
      }
    }
    return -1 // 全部点亮
  }

  /**
   * 检查是否所有星星都已点亮
   */
  isComplete(): boolean {
    return this.stars.every(star => star.isLit())
  }

  /**
   * 开始绘制连线动画
   */
  startDrawingConnections(): void {
    this.isDrawingConnections = true
    this.drawProgress = 0

    // 标记所有星星为已连接状态
    for (const star of this.stars) {
      star.connect()
    }
  }

  /**
   * 获取所有星星（用于渲染）
   */
  getStars(): Star[] {
    return this.stars
  }

  /**
   * 获取当前需要绘制的连线
   * 返回每条线的起点、终点和绘制进度
   */
  getConnectionsForRender(): Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    progress: number
  }> {
    if (!this.isDrawingConnections && this.drawProgress === 0) {
      return []
    }

    const result: Array<{
      from: { x: number; y: number }
      to: { x: number; y: number }
      progress: number
    }> = []

    const totalConnections = this.connections.length
    const progressPerConnection = 1 / totalConnections

    for (let i = 0; i < this.connections.length; i++) {
      const [fromIdx, toIdx] = this.connections[i]
      const connectionStart = i * progressPerConnection
      const connectionEnd = (i + 1) * progressPerConnection

      // 计算这条线的绘制进度
      let lineProgress = 0
      if (this.drawProgress >= connectionEnd) {
        lineProgress = 1
      } else if (this.drawProgress > connectionStart) {
        lineProgress = easeInOut((this.drawProgress - connectionStart) / progressPerConnection)
      }

      if (lineProgress > 0) {
        // 星星索引是 1-based，转为 0-based
        const fromStar = this.stars[fromIdx - 1]
        const toStar = this.stars[toIdx - 1]

        if (fromStar && toStar) {
          const from = fromStar.getScreenPosition(this.canvasWidth, this.canvasHeight)
          const to = toStar.getScreenPosition(this.canvasWidth, this.canvasHeight)

          result.push({ from, to, progress: lineProgress })
        }
      }
    }

    return result
  }

  /**
   * 获取已点亮的星星数量
   */
  getLitCount(): number {
    return this.stars.filter(star => star.isLit()).length
  }

  /**
   * 获取总星星数
   */
  getTotalCount(): number {
    return this.stars.length
  }

  /**
   * 清理
   */
  clear(): void {
    this.stars = []
    this.drawProgress = 0
    this.isDrawingConnections = false
  }
}
