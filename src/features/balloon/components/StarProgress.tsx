/**
 * 星星进度组件
 * 显示心形星座的收集进度（10颗星）
 */

interface StarProgressProps {
  collected: number
  total: number
}

export function StarProgress({ collected, total }: StarProgressProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 rounded-full backdrop-blur-sm">
      {/* 星星图标 */}
      <span className="text-lg drop-shadow-[0_0_4px_rgba(255,230,150,0.8)]">
        ⭐
      </span>

      {/* 进度文字 */}
      <span className="text-sm font-medium text-amber-100 tabular-nums">
        {collected}/{total}
      </span>

      {/* 迷你进度条 */}
      <div className="w-16 h-1.5 bg-indigo-900/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(collected / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
