import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

// 主题配色映射
const themeStyles = {
  coral: {
    bg: 'bg-gradient-to-br from-kids-card-coral to-kids-card-peach',
    border: 'border-kids-coral/50',
    accent: 'bg-kids-coral',
  },
  sky: {
    bg: 'bg-gradient-to-br from-kids-card-sky to-kids-card-lavender',
    border: 'border-kids-sky/50',
    accent: 'bg-kids-sky',
  },
  mint: {
    bg: 'bg-gradient-to-br from-kids-card-mint to-kids-card-sky',
    border: 'border-kids-mint/50',
    accent: 'bg-kids-mint',
  },
  lavender: {
    bg: 'bg-gradient-to-br from-kids-card-lavender to-kids-card-coral',
    border: 'border-kids-lavender/50',
    accent: 'bg-kids-lavender',
  },
} as const

type ThemeKey = keyof typeof themeStyles

interface GameCardProps {
  to: string
  emoji: string
  title: string
  description: string
  theme: ThemeKey
  character: string
  index: number
}

export function GameCard({
  to,
  emoji,
  title,
  description,
  theme,
  character,
  index,
}: GameCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  const styles = themeStyles[theme]

  // 交错入场动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100 + index * 120)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <Link
      to={to}
      className={`
        group relative block overflow-hidden
        rounded-3xl border-3
        ${styles.bg} ${styles.border}
        shadow-lg
        transition-all duration-300 ease-out
        active:scale-95
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* 主内容区 */}
      <div className="relative p-5 md:p-6">
        {/* Emoji 主图标 */}
        <div className="relative mb-4">
          {/* 背景光圈 */}
          <div
            className={`
              absolute inset-0 rounded-full blur-xl
              ${styles.accent} opacity-25
            `}
          />

          {/* 主 emoji */}
          <div className="relative text-6xl md:text-7xl text-center animate-bounce-soft">
            {emoji}
          </div>

          {/* 辅助角色 - 始终可见 */}
          <div className="absolute -bottom-1 -right-1 text-2xl md:text-3xl animate-wiggle">
            {character}
          </div>
        </div>

        {/* 标题 */}
        <h2
          className="text-lg md:text-xl font-bold text-kids-text mb-1"
          style={{
            fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive',
          }}
        >
          {title}
        </h2>

        {/* 描述 */}
        <p className="text-kids-text-secondary text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* 点击指示 - 始终可见 */}
      <div
        className={`
          absolute bottom-3 right-3
          w-8 h-8 rounded-full
          flex items-center justify-center
          bg-white/60
          transition-transform duration-200
          group-active:scale-90
        `}
      >
        <span className="text-lg text-kids-text-secondary">▶</span>
      </div>
    </Link>
  )
}
