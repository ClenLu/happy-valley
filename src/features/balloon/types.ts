// 星空许愿 - 字母气球游戏类型定义

// ============ 气球相关 ============

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
export type BalloonState =
  | 'floating'    // 正常漂浮
  | 'flyingToStar'// 飞向星星
  | 'dodging'     // 躲避中
  | 'done'        // 完成

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
  // 飞天动画参数
  flyProgress: number     // 飞天进度 0-1
  flyStartX: number       // 飞天起点 X
  flyStartY: number       // 飞天起点 Y
  flyTargetX: number      // 飞天目标 X（星星位置）
  flyTargetY: number      // 飞天目标 Y（星星位置）
  // 躲避动画参数
  dodgeProgress: number   // 躲避进度 0-1
  dodgeOffsetX: number    // 躲避偏移 X
  dodgeOffsetY: number    // 躲避偏移 Y
  originalX: number       // 躲避前的原始 X
}

// ============ 星星相关 ============

// 星星状态
export type StarState = 'empty' | 'appearing' | 'lit' | 'connected'

// 星星数据
export interface Star {
  id: number                        // 1-10
  letter: string                    // 对应的字母
  position: { x: number; y: number }// 天空中的固定位置（比例 0-1）
  state: StarState
  appearProgress: number            // 出现动画进度 0-1
  twinklePhase: number              // 闪烁相位
}

// 星座数据
export interface Constellation {
  stars: Star[]
  connections: [number, number][]   // 连线定义 [fromId, toId]
  shape: 'heart'                    // 最终形状
  drawProgress: number              // 连线绘制进度 0-1
}

// 星座布局配置（心形）
export const HEART_CONSTELLATION_LAYOUT: { x: number; y: number }[] = [
  // 心形底尖
  { x: 0.5, y: 0.35 },   // 1: 底尖
  // 心形左下
  { x: 0.35, y: 0.28 },  // 2
  // 心形左中
  { x: 0.25, y: 0.18 },  // 3
  // 心形左上
  { x: 0.30, y: 0.08 },  // 4
  // 心形顶左
  { x: 0.40, y: 0.05 },  // 5
  // 心形顶右
  { x: 0.60, y: 0.05 },  // 6
  // 心形右上
  { x: 0.70, y: 0.08 },  // 7
  // 心形右中
  { x: 0.75, y: 0.18 },  // 8
  // 心形右下
  { x: 0.65, y: 0.28 },  // 9
  // 回到底尖连接
  { x: 0.5, y: 0.35 },   // 10: 与1重合，形成闭环
]

// 心形连线顺序
export const HEART_CONNECTIONS: [number, number][] = [
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]
]

// ============ 游戏状态 ============

// 游戏阶段
export type GamePhase =
  | 'idle'        // 待机
  | 'intro'       // 开场动画
  | 'playing'     // 游戏中
  | 'flying'      // 气球飞天中
  | 'celebrating' // 庆祝中
  | 'ending'      // 结局动画

// 故事节点
export type StoryMoment =
  | { type: 'intro' }                          // 开场
  | { type: 'milestone'; star: number }        // 阶段里程碑
  | { type: 'almostDone'; remaining: number }  // 快完成了
  | { type: 'finale' }                         // 大结局

// 游戏进度
export interface GameProgress {
  currentRound: number              // 1-10
  collectedStars: number            // 已收集星星数
  targetLetter: string              // 当前目标字母
  phase: GamePhase                  // 当前阶段
  storyMoment: StoryMoment | null   // 当前故事节点
}

// 游戏状态
export interface GameState {
  phase: GamePhase
  targetLetter: string
  balloons: BalloonData[]
  currentRound: number              // 1-10
  collectedStars: number            // 已收集的星星数
  totalStars: number                // 总共需要的星星数（10）
}

// 游戏配置
export interface GameConfig {
  totalStars: number                // 目标星星数（10）
  balloonCountRange: [number, number] // 气球数量范围 [2, 4]
  baseBalloonSpeed: number          // 基础速度
  flyToStarDuration: number         // 飞天动画时长 ms
  dodgeDuration: number             // 躲避动画时长 ms
  dodgeDistance: number             // 躲避距离 px
}

// 默认游戏配置
export const DEFAULT_GAME_CONFIG: GameConfig = {
  totalStars: 10,
  balloonCountRange: [2, 4],
  baseBalloonSpeed: 0.3,
  flyToStarDuration: 2000,
  dodgeDuration: 600,
  dodgeDistance: 40,
}

// ============ 粒子相关 ============

// 粒子类型
export type ParticleType = 'star' | 'confetti' | 'stardust' | 'trail'

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
  type: ParticleType
  rotation: number
  rotationSpeed: number
  // 轨迹粒子附加属性
  alpha?: number
}

// ============ 云朵相关 ============

// 云朵数据（背景装饰）
export interface Cloud {
  x: number
  y: number
  size: number      // 相对大小 0.5-1.5
  speed: number     // 移动速度
  opacity: number   // 透明度 0.3-0.6
}

// ============ 游戏事件 ============

export type GameEvent =
  | { type: 'tap'; x: number; y: number }
  | { type: 'correct'; letter: string; starId: number }
  | { type: 'wrong'; tappedLetter: string; correctLetter: string }
  | { type: 'starCollected'; starId: number }
  | { type: 'gameComplete' }
