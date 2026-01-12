// 气球游戏类型定义

// 气球颜色主题
export type BalloonColor =
  | 'coral'    // 珊瑚红
  | 'mint'     // 薄荷绿
  | 'sky'      // 天空蓝
  | 'lemon'    // 柠檬黄
  | 'lavender' // 淡紫色
  | 'peach'    // 蜜桃橙

// 气球颜色值映射
export const BALLOON_COLORS: Record<BalloonColor, { fill: string; stroke: string; highlight: string }> = {
  coral:    { fill: '#FF9A8B', stroke: '#E07A6B', highlight: '#FFB5A8' },
  mint:     { fill: '#7DD3B0', stroke: '#5AB090', highlight: '#A0E8CB' },
  sky:      { fill: '#7EC8E8', stroke: '#5CA8C8', highlight: '#A5DBEF' },
  lemon:    { fill: '#FFE066', stroke: '#E0C050', highlight: '#FFEB99' },
  lavender: { fill: '#B8A4D8', stroke: '#9484B8', highlight: '#D0C2E8' },
  peach:    { fill: '#FFB07C', stroke: '#E09060', highlight: '#FFC9A0' },
}

// 气球状态
export type BalloonState = 'floating' | 'popping' | 'done'

// 气球实体数据
export interface BalloonData {
  id: number
  letter: string
  x: number
  y: number
  color: BalloonColor
  state: BalloonState
  // 动画参数
  phase: number           // 摇摆相位
  swingAmplitude: number  // 摇摆幅度
  speed: number           // 上升速度
  scale: number           // 缩放
  rotation: number        // 旋转角度
  // 爆破动画
  popProgress: number     // 爆破进度 0-1
}

// 游戏阶段
export type GamePhase = 'ready' | 'playing' | 'celebrating'

// 游戏状态
export interface GameState {
  phase: GamePhase
  targetLetter: string
  balloons: BalloonData[]
  difficulty: 1 | 2 | 3 | 4
  consecutiveCorrect: number
  score: number
}

// 难度配置
export interface DifficultyConfig {
  balloonCount: number
  baseSpeed: number
  spawnInterval: number
}

export const DIFFICULTY_CONFIGS: Record<1 | 2 | 3 | 4, DifficultyConfig> = {
  1: { balloonCount: 2, baseSpeed: 0.5, spawnInterval: 2000 },
  2: { balloonCount: 3, baseSpeed: 0.6, spawnInterval: 1800 },
  3: { balloonCount: 4, baseSpeed: 0.7, spawnInterval: 1600 },
  4: { balloonCount: 5, baseSpeed: 0.8, spawnInterval: 1400 },
}

// 粒子数据
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  type: 'star' | 'confetti'
  rotation: number
  rotationSpeed: number
}

// 游戏事件
export type GameEvent =
  | { type: 'tap'; x: number; y: number }
  | { type: 'correct'; letter: string }
  | { type: 'wrong'; tappedLetter: string; correctLetter: string }
  | { type: 'missed'; letter: string }
  | { type: 'levelUp'; newLevel: number }
