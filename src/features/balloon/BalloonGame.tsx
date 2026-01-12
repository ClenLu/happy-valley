import { useState, useCallback } from 'react'
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
    // 升级时不播报
  }, [])

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

        {/* 开始游戏覆盖层 */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/30 backdrop-blur-sm">
            <div className="text-6xl animate-bounce-soft">
              🎈
            </div>
            <h1 className="text-2xl font-bold text-kids-text">
              字母气球
            </h1>
            <button
              onClick={handleStart}
              className="px-8 py-4 text-xl font-bold text-white bg-kids-sky rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              开始游戏 ▶
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
