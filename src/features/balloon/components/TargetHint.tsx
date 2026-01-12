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
        <span className="text-3xl animate-wiggle inline-block" style={{ animationDuration: '2s' }}>
          🐻
        </span>
        {/* 小熊的思考泡泡 */}
        <div className="absolute -top-1 -right-1 text-xs animate-bounce-soft">💭</div>
      </div>

      {/* 气泡卡片 */}
      <button
        onClick={handleClick}
        onTouchEnd={handleClick}
        className="
          group relative px-5 py-2.5
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
          absolute -left-2 bottom-3
          w-3 h-3 bg-white/95 rotate-45
          border-l-2 border-b-2 border-kids-sky/40
        " />

        {/* 内容 */}
        <div className="relative flex items-center gap-2">
          <span className="text-xs text-kids-text-muted">找到</span>
          <span className="
            text-2xl font-bold text-kids-sky
            group-hover:animate-bounce-soft
            transition-transform
            drop-shadow-sm
          ">
            {letter}
          </span>
          <span className="text-sm opacity-50 group-hover:opacity-100 transition-opacity">
            🔊
          </span>
        </div>
      </button>
    </div>
  )
}
