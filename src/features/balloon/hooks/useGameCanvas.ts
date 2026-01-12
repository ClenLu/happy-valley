import { useRef, useEffect, useCallback } from 'react'
import { Game, type GameCallbacks } from '../canvas/Game'
import type { GamePhase } from '../types'

interface UseGameCanvasOptions {
  onCorrect: (letter: string) => void
  onWrong: (tappedLetter: string, correctLetter: string) => void
  onMissed: (letter: string) => void
  onStarCollected: (starId: number, totalCollected: number) => void
  onNewRound: (targetLetter: string, round: number) => void
  onPhaseChange: (phase: GamePhase) => void
  onGameComplete: () => void
}

export function useGameCanvas(options: UseGameCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用 ref 存储回调，避免 Game 实例因回调变化而重建
  const callbacksRef = useRef<UseGameCanvasOptions>(options)
  callbacksRef.current = options

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const game = gameRef.current
      if (!game) return
      const rect = container.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        game.resize(rect.width, rect.height)
      }
    }

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      gameRef.current?.stop()
    }
  }, [])

  // 初始化 Game 实例（延迟初始化，因为 canvas 可能一开始是 hidden 的）
  const initGame = useCallback(() => {
    if (gameRef.current) return // 已初始化

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const callbacks: GameCallbacks = {
      onCorrect: (letter) => callbacksRef.current.onCorrect(letter),
      onWrong: (tapped, correct) => callbacksRef.current.onWrong(tapped, correct),
      onMissed: (letter) => callbacksRef.current.onMissed(letter),
      onStarCollected: (starId, total) => callbacksRef.current.onStarCollected(starId, total),
      onNewRound: (letter, round) => callbacksRef.current.onNewRound(letter, round),
      onPhaseChange: (phase) => callbacksRef.current.onPhaseChange(phase),
      onGameComplete: () => callbacksRef.current.onGameComplete(),
    }

    const game = new Game(canvas, callbacks)
    gameRef.current = game
  }, [])

  // 开始游戏
  const startGame = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // 确保 Game 已初始化
    initGame()

    const game = gameRef.current
    if (!game) return

    // 确保尺寸正确（从 hidden 变为可见后）
    const rect = container.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      game.resize(rect.width, rect.height)
    }

    game.start()
  }, [initGame])

  // 停止游戏
  const stopGame = useCallback(() => {
    gameRef.current?.stop()
  }, [])

  // 处理点击/触摸
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!gameRef.current) return

    let clientX: number
    let clientY: number

    if ('touches' in e) {
      // 触摸事件
      if (e.touches.length === 0) return
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // 鼠标事件
      clientX = e.clientX
      clientY = e.clientY
    }

    gameRef.current.handleTap(clientX, clientY)
  }, [])

  // 获取星座进度
  const getProgress = useCallback(() => {
    return gameRef.current?.getConstellationProgress() ?? { collected: 0, total: 10 }
  }, [])

  return {
    canvasRef,
    containerRef,
    startGame,
    stopGame,
    handleTap,
    getProgress,
  }
}
