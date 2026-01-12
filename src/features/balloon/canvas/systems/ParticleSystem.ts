import type { Particle } from '../../types'
import { BALLOON_COLORS, type BalloonColor } from '../../types'

const PARTICLE_COLORS = ['#FF9A8B', '#7DD3B0', '#7EC8E8', '#FFE066', '#B8A4D8', '#FFB07C']
const CELEBRATION_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA']

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
    const particleCount = isCorrect ? 25 : 8  // 增加粒子数量

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 120 + Math.random() * 180  // 更快的速度
      const isStarType = isCorrect && i < particleCount / 2

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,  // 更大的向上偏移
        size: isStarType ? 10 + Math.random() * 8 : 6 + Math.random() * 5,  // 更大的粒子
        color: isCorrect
          ? (i % 2 === 0 ? '#FFE066' : PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)])
          : colors.fill,
        life: 1.2,  // 更长的生命周期
        maxLife: 1.2,
        type: isStarType ? 'star' : 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 12,
      })
    }
  }

  /**
   * 创建升级庆祝效果 - 烟花式全屏庆祝
   */
  createLevelUpCelebration(centerX: number, centerY: number): void {
    // 创建多波烟花
    const burstCount = 3
    for (let burst = 0; burst < burstCount; burst++) {
      const offsetX = (Math.random() - 0.5) * 100
      const offsetY = (Math.random() - 0.5) * 60
      const x = centerX + offsetX
      const y = centerY + offsetY

      // 每波烟花 15-20 个粒子
      const particleCount = 15 + Math.floor(Math.random() * 6)
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3
        const speed = 150 + Math.random() * 200

        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 100,
          size: 12 + Math.random() * 8,
          color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
          life: 1.5,
          maxLife: 1.5,
          type: 'star',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 15,
        })
      }
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
