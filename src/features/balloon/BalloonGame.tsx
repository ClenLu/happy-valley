import { useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useGameCanvas } from './hooks/useGameCanvas'
import { useSpeech } from './hooks/useSpeech'
import { TargetHint } from './components/TargetHint'
import { StarProgress } from './components/StarProgress'
import type { GamePhase } from './types'

type GameStatus = 'idle' | 'playing' | 'complete'

export function BalloonGame() {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [collectedStars, setCollectedStars] = useState(0)
  const [totalStars] = useState(10)
  const [targetLetter, setTargetLetter] = useState('')
  const [, setCurrentRound] = useState(0) // 轮次仅供内部追踪
  const [showCelebration, setShowCelebration] = useState(false)

  const speech = useSpeech()

  // 游戏回调
  const handleCorrect = useCallback((letter: string) => {
    speech.sayLetter(letter)
  }, [speech])

  const handleWrong = useCallback((tappedLetter: string, _correctLetter: string) => {
    speech.sayLetter(tappedLetter)
  }, [speech])

  const handleMissed = useCallback((_letter: string) => {
    // 错过时不播报
  }, [])

  const handleStarCollected = useCallback((_starId: number, totalCollected: number) => {
    setCollectedStars(totalCollected)
    // 收集星星时的反馈（可以添加音效）
  }, [])

  const handleNewRound = useCallback((letter: string, round: number) => {
    setTargetLetter(letter)
    setCurrentRound(round)
    // 延迟播放，等气球出现
    setTimeout(() => {
      speech.sayLetter(letter)
    }, 300)
  }, [speech])

  const handlePhaseChange = useCallback((phase: GamePhase) => {
    if (phase === 'celebrating') {
      setShowCelebration(true)
    } else if (phase === 'ending') {
      setStatus('complete')
    }
  }, [])

  const handleGameComplete = useCallback(() => {
    // 游戏完成
  }, [])

  // 庆祝动画自动消失
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showCelebration])

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
    onStarCollected: handleStarCollected,
    onNewRound: handleNewRound,
    onPhaseChange: handlePhaseChange,
    onGameComplete: handleGameComplete,
  })

  // 开始游戏
  const handleStart = useCallback(() => {
    setStatus('playing')
    setCollectedStars(0)
    setCurrentRound(0)
    setShowCelebration(false)
    requestAnimationFrame(() => {
      startGame()
    })
  }, [startGame])

  // 重新开始
  const handleRestart = useCallback(() => {
    handleStart()
  }, [handleStart])

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between w-full px-2">
        <Link
          to="/"
          className="group flex items-center gap-2 px-3 py-2 rounded-full
                     bg-indigo-950/60 hover:bg-indigo-900/70 backdrop-blur-sm
                     transition-all duration-300 active:scale-95"
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm font-medium text-indigo-200">返回</span>
        </Link>

        {status === 'playing' && (
          <StarProgress collected={collectedStars} total={totalStars} />
        )}
      </div>

      {/* 游戏画布 */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl touch-none"
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

        {/* 庆祝完成提示 */}
        {showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="relative animate-bounce-soft">
              {/* 光晕背景 */}
              <div className="absolute inset-0 -m-12 bg-gradient-radial from-amber-300/40 via-transparent to-transparent rounded-full blur-2xl" />

              {/* 主内容 */}
              <div className="relative flex flex-col items-center gap-3 px-10 py-6 bg-indigo-950/80 rounded-2xl shadow-2xl border-2 border-amber-400/50 backdrop-blur-sm">
                {/* 星星装饰 */}
                <div className="absolute -top-4 -left-4 text-3xl animate-spin-slow drop-shadow-[0_0_8px_rgba(255,230,150,0.8)]">⭐</div>
                <div className="absolute -top-4 -right-4 text-3xl animate-spin-slow drop-shadow-[0_0_8px_rgba(255,230,150,0.8)]" style={{ animationDelay: '0.2s' }}>⭐</div>

                {/* 完成文字 */}
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200">
                  心形星座完成！
                </div>

                {/* 爱心庆祝 */}
                <div className="text-5xl animate-pulse">
                  💖✨💖
                </div>

                {/* 鼓励文字 */}
                <div className="text-sm text-amber-200/80">
                  你收集了所有的星星！
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 游戏完成界面 */}
        {status === 'complete' && !showCelebration && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/90 to-purple-950/90 backdrop-blur-sm z-20">
            {/* 星空装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.3 + Math.random() * 0.7,
                  }}
                />
              ))}
            </div>

            {/* 主内容 */}
            <div className="relative flex flex-col items-center gap-6 z-10">
              {/* 心形星座图标 */}
              <div className="text-7xl drop-shadow-[0_0_20px_rgba(255,200,150,0.6)]">
                💝
              </div>

              {/* 完成文字 */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-amber-100 mb-2">
                  太棒了！
                </h2>
                <p className="text-amber-200/70">
                  你成功点亮了心形星座
                </p>
              </div>

              {/* 重新开始按钮 */}
              <button
                onClick={handleRestart}
                className="
                  group relative mt-4 px-10 py-4
                  text-xl font-bold text-indigo-950
                  bg-gradient-to-b from-amber-300 to-amber-400
                  rounded-full shadow-lg shadow-amber-500/30
                  hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105
                  active:scale-95 active:shadow-md
                  transition-all duration-200
                "
              >
                {/* 按钮光泽 */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full" />
                <span className="relative flex items-center gap-2">
                  再来一次
                  <span className="group-hover:rotate-180 transition-transform duration-300">🌟</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 开始游戏覆盖层 - 星空许愿主题 */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0D1B2A] via-[#1B263B] to-[#2E3A59] overflow-hidden">
            {/* 背景星星 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    opacity: 0.2 + Math.random() * 0.8,
                  }}
                />
              ))}
            </div>

            {/* 飘动云朵 */}
            <div className="absolute top-[10%] left-[5%] text-3xl opacity-30 animate-float-gentle" style={{ animationDelay: '0s' }}>☁️</div>
            <div className="absolute top-[20%] right-[10%] text-2xl opacity-20 animate-float-gentle" style={{ animationDelay: '0.5s' }}>☁️</div>

            {/* 装饰气球 */}
            <div className="absolute top-[25%] left-[8%] text-4xl animate-float-gentle opacity-70" style={{ animationDelay: '0.2s' }}>🎈</div>
            <div className="absolute top-[30%] right-[10%] text-4xl animate-float-gentle opacity-70" style={{ animationDelay: '0.6s' }}>🎈</div>

            {/* 主角区域 */}
            <div className="relative flex flex-col items-center gap-6 z-10">
              {/* 心形星座预览 */}
              <div className="relative">
                <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,200,150,0.5)] animate-pulse">
                  💫
                </div>
                {/* 围绕的小星星 */}
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce-soft">⭐</div>
                <div className="absolute -bottom-1 -left-3 text-xl animate-bounce-soft" style={{ animationDelay: '0.3s' }}>⭐</div>
              </div>

              {/* 故事化标题 */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-amber-100 mb-2" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive' }}>
                  星空许愿
                </h1>
                <p className="text-sm text-indigo-300/80 max-w-[200px]">
                  点对字母气球，收集星星，点亮心形星座
                </p>
              </div>

              {/* 开始按钮 */}
              <button
                onClick={handleStart}
                className="
                  group relative mt-4 px-10 py-4
                  text-xl font-bold text-indigo-950
                  bg-gradient-to-b from-amber-300 to-amber-400
                  rounded-full shadow-lg shadow-amber-500/30
                  hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105
                  active:scale-95 active:shadow-md
                  transition-all duration-200
                "
              >
                {/* 按钮光泽 */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full" />
                <span className="relative flex items-center gap-2">
                  开始许愿
                  <span className="group-hover:translate-x-1 transition-transform">✨</span>
                </span>
              </button>
            </div>

            {/* 底部装饰山脉剪影 */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 400 80" className="w-full h-16 fill-indigo-950/50">
                <path d="M0,80 L0,60 Q50,30 100,50 T200,35 T300,45 T400,30 L400,80 Z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
