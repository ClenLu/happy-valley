import { createFileRoute } from '@tanstack/react-router'
import { GameGrid } from '@/features/home'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// 飘动的云朵组件
function FloatingCloud({
  size,
  top,
  delay,
  duration
}: {
  size: 'sm' | 'md' | 'lg'
  top: string
  delay: number
  duration: number
}) {
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-6xl',
  }

  return (
    <div
      className={`absolute ${sizeClasses[size]} opacity-60 animate-float-cloud`}
      style={{
        top,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      ☁️
    </div>
  )
}

// 闪烁的星星组件
function TwinkleStar({ top, left, delay }: { top: string; left: string; delay: number }) {
  return (
    <div
      className="absolute text-2xl animate-twinkle"
      style={{ top, left, animationDelay: `${delay}s` }}
    >
      ✨
    </div>
  )
}

// 弹跳的装饰 emoji
function BouncingDecor({ emoji, className, delay }: { emoji: string; className: string; delay: number }) {
  return (
    <span
      className={`inline-block animate-bounce-soft ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {emoji}
    </span>
  )
}

function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-kids-bg-sky via-kids-bg-cream to-kids-bg-peach">
      {/* 背景装饰层 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 飘动的云朵 */}
        <FloatingCloud size="lg" top="5%" delay={0} duration={25} />
        <FloatingCloud size="md" top="15%" delay={5} duration={20} />
        <FloatingCloud size="sm" top="8%" delay={10} duration={30} />
        <FloatingCloud size="md" top="25%" delay={15} duration={22} />
        <FloatingCloud size="sm" top="35%" delay={8} duration={28} />

        {/* 闪烁的星星 */}
        <TwinkleStar top="10%" left="15%" delay={0} />
        <TwinkleStar top="20%" left="80%" delay={0.5} />
        <TwinkleStar top="35%" left="25%" delay={1} />
        <TwinkleStar top="15%" left="60%" delay={1.5} />
        <TwinkleStar top="30%" left="90%" delay={2} />
        <TwinkleStar top="5%" left="45%" delay={0.8} />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* 标题区域 */}
        <header
          className={`text-center mb-10 md:mb-14 transition-all duration-1000 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* 欢迎装饰 */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <BouncingDecor emoji="🌈" className="text-3xl md:text-4xl" delay={0.2} />
            <BouncingDecor emoji="⭐" className="text-2xl md:text-3xl" delay={0.4} />
            <BouncingDecor emoji="🌸" className="text-3xl md:text-4xl" delay={0.6} />
          </div>

          {/* 主标题 - 带弹跳动画 */}
          <h1
            className={`text-4xl md:text-6xl font-black mb-4 transition-all duration-700 ease-bounce-in ${
              mounted ? 'scale-100' : 'scale-0'
            }`}
            style={{
              transitionDelay: '200ms',
              fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive',
            }}
          >
            <span className="inline-block animate-wiggle" style={{ animationDelay: '1s' }}>
              🎮
            </span>
            <span className="bg-gradient-to-r from-kids-coral via-kids-sky to-kids-mint bg-clip-text text-transparent px-2">
              游戏乐园
            </span>
            <span className="inline-block animate-wiggle" style={{ animationDelay: '1.2s' }}>
              🎠
            </span>
          </h1>

          {/* 副标题 */}
          <p
            className={`text-lg md:text-xl text-kids-text-secondary transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="animate-pulse">🎪</span>
              选择一个游戏开始冒险吧！
              <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>🎪</span>
            </span>
          </p>

          {/* 可爱的分隔线 */}
          <div
            className={`flex justify-center items-center gap-2 mt-6 transition-all duration-700 ${
              mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <span className="text-xl">🌟</span>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-kids-lemon to-kids-coral" />
            <span className="text-2xl animate-bounce-soft">🦋</span>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-kids-coral to-kids-sky" />
            <span className="text-xl">🌟</span>
          </div>
        </header>

        {/* 游戏网格区域 */}
        <div
          className={`transition-all duration-1000 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <GameGrid />
        </div>

        {/* 底部装饰 */}
        <footer
          className={`mt-12 md:mt-16 text-center transition-all duration-700 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <div className="flex justify-center items-end gap-4 md:gap-6">
            <span className="text-3xl md:text-4xl animate-sway" style={{ animationDelay: '0s' }}>🌻</span>
            <span className="text-4xl md:text-5xl animate-sway" style={{ animationDelay: '0.3s' }}>🌷</span>
            <span className="text-2xl md:text-3xl animate-hop">🐰</span>
            <span className="text-4xl md:text-5xl animate-sway" style={{ animationDelay: '0.6s' }}>🌸</span>
            <span className="text-3xl md:text-4xl animate-sway" style={{ animationDelay: '0.9s' }}>🌼</span>
          </div>
          <p className="text-kids-text-muted text-sm mt-4">
            专为 2-4 岁小朋友设计 💝
          </p>
        </footer>
      </div>

      {/* 底部渐变遮罩 - 营造梦幻感 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-kids-bg-warm/80 to-transparent pointer-events-none" />
    </main>
  )
}
