import { useCallback, useEffect, useState } from 'react'

interface TargetHintProps {
  letter: string
  onTap: () => void
}

/**
 * 目标字母气泡卡片 - 迪士尼风格
 * 小熊角色陪伴 + 点击可播报字母
 */
export function TargetHint({ letter, onTap }: TargetHintProps) {
  const [isEntering, setIsEntering] = useState(true)

  // 入场动画
  useEffect(() => {
    setIsEntering(true)
    const timer = setTimeout(() => setIsEntering(false), 300)
    return () => clearTimeout(timer)
  }, [letter])

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    onTap()
  }, [onTap])

  return (
    <div className={`
      flex items-end gap-2
      transition-all duration-300
      ${isEntering ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
    `}>
      {/* 小熊角色 - 好奇地看着气泡 */}
      <div className="relative flex-shrink-0">
        <span className="text-4xl animate-wiggle inline-block" style={{ animationDuration: '2s' }}>
          🐻
        </span>
        {/* 小熊的思考泡泡 */}
        <div className="absolute -top-1 -right-1 text-sm animate-bounce-soft">💭</div>
      </div>

      {/* 气泡卡片 */}
      <button
        onClick={handleClick}
        onTouchEnd={handleClick}
        className="
          group relative px-6 py-3
          bg-white/95 backdrop-blur-sm
          rounded-2xl shadow-lg
          border-2 border-kids-sky/40
          transition-all duration-200
          hover:scale-105 hover:shadow-xl
          active:scale-95
          cursor-pointer
        "
      >
        {/* 气泡尾巴 - 指向小熊 */}
        <div className="
          absolute -left-2 bottom-4
          w-4 h-4 bg-white/95 rotate-45
          border-l-2 border-b-2 border-kids-sky/40
        " />

        {/* 内容 */}
        <div className="relative flex items-center gap-3">
          <span className="text-sm text-kids-text-muted">找到</span>
          <span className="
            text-5xl font-bold text-kids-sky
            group-hover:animate-bounce-soft
            transition-transform
            drop-shadow-md
          ">
            {letter}
          </span>
          <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
            🔊
          </span>
        </div>
      </button>
    </div>
  )
}
