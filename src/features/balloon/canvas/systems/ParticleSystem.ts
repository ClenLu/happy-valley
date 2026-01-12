import type { Particle } from '../../types'
import { BALLOON_COLORS, type BalloonColor } from '../../types'

const PARTICLE_COLORS = ['#FF9A8B', '#7DD3B0', '#7EC8E8', '#FFE066', '#B8A4D8', '#FFB07C']

/**
 * 粒子系统
 * 处理爆破时的星星和彩纸效果
 */
export class ParticleSystem {
  private particles: Particle[] = []

  /**
   * 创建爆破粒子
   */
  createExplosion(x: number, y: number, color: BalloonColor, isCorrect: boolean): void {
    const colors = BALLOON_COLORS[color]
    const particleCount = isCorrect ? 20 : 8

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 100 + Math.random() * 150
      const isStarType = isCorrect && i < particleCount / 2

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,  // 向上偏移
        size: isStarType ? 8 + Math.random() * 6 : 5 + Math.random() * 4,
        color: isCorrect
          ? (i % 2 === 0 ? '#FFE066' : PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)])
          : colors.fill,
        life: 1,
        maxLife: 1,
        type: isStarType ? 'star' : 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }
  }

  /**
   * 更新所有粒子
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000
    const gravity = 300

    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += gravity * dt  // 重力
      p.vx *= 0.98  // 空气阻力
      p.life -= dt * 1.5
      p.rotation += p.rotationSpeed * dt
    }

    // 移除已消失的粒子
    this.particles = this.particles.filter(p => p.life > 0)
  }

  /**
   * 获取所有粒子
   */
  getParticles(): Particle[] {
    return this.particles
  }

  /**
   * 清空所有粒子
   */
  clear(): void {
    this.particles = []
  }
}
