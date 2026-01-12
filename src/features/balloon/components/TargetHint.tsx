import { useCallback } from 'react'

interface TargetHintProps {
  letter: string
  onTap: () => void
}

/**
 * 目标字母气泡卡片
 * 点击可播报字母
 */
export function TargetHint({ letter, onTap }: TargetHintProps) {
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    onTap()
  }, [onTap])

  return (
    <button
      onClick={handleClick}
      onTouchEnd={handleClick}
      className="
        group relative px-6 py-3
        bg-white/90 backdrop-blur-sm
        rounded-full shadow-lg
        border-2 border-kids-sky/30
        transition-all duration-200
        hover:scale-105 hover:shadow-xl
        active:scale-95
        cursor-pointer
      "
    >
      {/* 气泡尾巴 */}
      <div className="
        absolute -bottom-2 left-1/2 -translate-x-1/2
        w-4 h-4 bg-white/90 rotate-45
        border-r-2 border-b-2 border-kids-sky/30
      " />

      {/* 内容 */}
      <div className="relative flex items-center gap-3">
        <span className="text-sm text-kids-text-secondary">找到</span>
        <span className="
          text-3xl font-bold text-kids-sky
          group-hover:animate-bounce-soft
          transition-transform
        ">
          {letter}
        </span>
        <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
          🔊
        </span>
      </div>
    </button>
  )
}
