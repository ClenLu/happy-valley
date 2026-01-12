import { useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useGameCanvas } from './hooks/useGameCanvas'
import { useSpeech } from './hooks/useSpeech'
import { TargetHint } from './components/TargetHint'

type GameStatus = 'idle' | 'playing'

export function BalloonGame() {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [targetLetter, setTargetLetter] = useState('')
  const [showLevelUp, setShowLevelUp] = useState(false)

  const speech = useSpeech()

  // 游戏回调 - 所有语音只播报字母本身
  const handleCorrect = useCallback((letter: string) => {
    setScore(s => s + 1)
    speech.sayLetter(letter)
  }, [speech])

  const handleWrong = useCallback((tappedLetter: string, _correctLetter: string) => {
    speech.sayLetter(tappedLetter)
  }, [speech])

  const handleMissed = useCallback((_letter: string) => {
    // 错过时不播报
  }, [])

  const handleLevelUp = useCallback((newLevel: number) => {
    setLevel(newLevel)
    // 显示升级提示
    setShowLevelUp(true)
  }, [])

  // 升级提示自动消失
  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [showLevelUp])

  const handleNewRound = useCallback((letter: string) => {
    setTargetLetter(letter)
    // 延迟播放，等气球出现，只播报字母
    setTimeout(() => {
      speech.sayLetter(letter)
    }, 300)
  }, [speech])

  // 点击气泡卡片播报字母
  const handleHintTap = useCallback(() => {
    if (targetLetter) {
      speech.sayLetter(targetLetter)
    }
  }, [targetLetter, speech])

  const { canvasRef, containerRef, startGame, handleTap } = useGameCanvas({
    onCorrect: handleCorrect,
    onWrong: handleWrong,
    onMissed: handleMissed,
    onLevelUp: handleLevelUp,
    onNewRound: handleNewRound,
  })

  // 开始游戏
  const handleStart = useCallback(() => {
    setStatus('playing')
    setScore(0)
    setLevel(1)
    // 等待一帧确保 DOM 更新后再启动
    requestAnimationFrame(() => {
      startGame()
    })
  }, [startGame])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between w-full px-2">
        <Link
          to="/"
          className="group flex items-center gap-2 px-3 py-2 rounded-full
                     bg-white/60 hover:bg-white/90
                     transition-all duration-300 active:scale-95"
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm font-medium text-kids-text-secondary">返回</span>
        </Link>

        {status === 'playing' && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-kids-text-muted">
              难度 {level}
            </span>
            <span className="text-lg font-bold text-kids-text">
              ⭐ {score}
            </span>
          </div>
        )}
      </div>

      {/* 游戏画布 */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] max-h-[70vh] bg-gradient-to-b from-kids-bg-sky to-kids-bg-cream rounded-2xl overflow-hidden shadow-lg touch-none"
        onMouseDown={status === 'playing' ? handleTap : undefined}
        onTouchStart={status === 'playing' ? handleTap : undefined}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* 目标字母气泡卡片 */}
        {status === 'playing' && targetLetter && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <TargetHint letter={targetLetter} onTap={handleHintTap} />
          </div>
        )}

        {/* 升级庆祝提示 */}
        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="relative animate-bounce-soft">
              {/* 光晕背景 */}
              <div className="absolute inset-0 -m-8 bg-gradient-radial from-yellow-200/60 via-transparent to-transparent rounded-full blur-xl" />

              {/* 主内容 */}
              <div className="relative flex flex-col items-center gap-2 px-8 py-4 bg-white/90 rounded-2xl shadow-xl border-4 border-kids-lemon">
                {/* 星星装饰 */}
                <div className="absolute -top-3 -left-3 text-2xl animate-spin-slow">⭐</div>
                <div className="absolute -top-3 -right-3 text-2xl animate-spin-slow" style={{ animationDelay: '0.2s' }}>⭐</div>

                {/* 升级文字 */}
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-kids-coral via-kids-lemon to-kids-mint">
                  Level Up!
                </div>

                {/* 小熊庆祝 */}
                <div className="text-4xl animate-wiggle">
                  🎉🐻🎉
                </div>

                {/* 当前等级 */}
                <div className="text-sm text-kids-text-secondary">
                  难度 {level}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 开始游戏覆盖层 - 迪士尼魔法风格 */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-kids-bg-sky via-kids-bg-cream to-kids-bg-warm overflow-hidden">
            {/* 飘动的装饰云朵 */}
            <div className="absolute top-[10%] left-[5%] text-4xl opacity-60 animate-float-gentle" style={{ animationDelay: '0s' }}>☁️</div>
            <div className="absolute top-[15%] right-[10%] text-3xl opacity-50 animate-float-gentle" style={{ animationDelay: '0.5s' }}>☁️</div>
            <div className="absolute top-[25%] left-[15%] text-2xl opacity-40 animate-float-gentle" style={{ animationDelay: '1s' }}>☁️</div>

            {/* 装饰气球 - 左侧 */}
            <div className="absolute top-[20%] left-[8%] text-5xl animate-float-gentle opacity-80" style={{ animationDelay: '0.2s' }}>🎈</div>
            <div className="absolute top-[45%] left-[5%] text-4xl animate-float-gentle opacity-70" style={{ animationDelay: '0.7s' }}>🎈</div>

            {/* 装饰气球 - 右侧 */}
            <div className="absolute top-[25%] right-[8%] text-5xl animate-float-gentle opacity-80" style={{ animationDelay: '0.4s' }}>🎈</div>
            <div className="absolute top-[50%] right-[6%] text-4xl animate-float-gentle opacity-70" style={{ animationDelay: '0.9s' }}>🎈</div>

            {/* 主角区域 */}
            <div className="relative flex flex-col items-center gap-4 z-10">
              {/* 小熊角色 + 主气球 */}
              <div className="relative">
                {/* 主气球 - 带弹性动画 */}
                <div className="text-7xl animate-bounce-soft drop-shadow-lg">
                  🎈
                </div>
                {/* 小熊抓气球 */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-5xl animate-wiggle">
                  🐻
                </div>
              </div>

              {/* 故事化标题 */}
              <div className="text-center mt-4">
                <h1 className="text-2xl font-bold text-kids-text mb-1" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive' }}>
                  帮小熊抓气球！
                </h1>
                <p className="text-sm text-kids-text-secondary">
                  找到正确的字母气球
                </p>
              </div>

              {/* 开始按钮 - 增强交互感 */}
              <button
                onClick={handleStart}
                className="
                  group relative mt-4 px-10 py-4
                  text-xl font-bold text-white
                  bg-gradient-to-b from-kids-sky to-kids-sky-deep
                  rounded-full shadow-lg
                  hover:shadow-xl hover:scale-105
                  active:scale-95 active:shadow-md
                  transition-all duration-200
                  overflow-hidden
                "
              >
                {/* 按钮光泽 */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/30 rounded-full" />
                {/* 按钮内容 */}
                <span className="relative flex items-center gap-2">
                  开始冒险
                  <span className="group-hover:translate-x-1 transition-transform">▶</span>
                </span>
              </button>
            </div>

            {/* 底部装饰 - 草地 */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-kids-mint/30 to-transparent" />
            <div className="absolute bottom-2 left-[10%] text-2xl">🌸</div>
            <div className="absolute bottom-3 left-[30%] text-xl">🌼</div>
            <div className="absolute bottom-2 right-[25%] text-2xl">🌷</div>
            <div className="absolute bottom-3 right-[10%] text-xl">🌻</div>
          </div>
        )}
      </div>
    </div>
  )
}
