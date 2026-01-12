import { GameCard } from './GameCard'

// 每个游戏都有独特的配色主题，营造"游戏王国"的多彩感
const games = [
  {
    to: '/games/counting',
    emoji: '🔢',
    title: '数量配对',
    description: '数一数，找出正确的数字',
    theme: 'coral' as const,
    character: '🐣', // 辅助角色 - 小鸡学数数
  },
  {
    to: '/games/balloon',
    emoji: '🎈',
    title: '字母气球',
    description: '点击正确的字母气球',
    theme: 'sky' as const,
    character: '🐻', // 辅助角色 - 小熊抓气球
  },
  {
    to: '/games/colors',
    emoji: '🎨',
    title: '颜色认知',
    description: '认识不同的颜色',
    theme: 'mint' as const,
    character: '🦋', // 辅助角色 - 蝴蝶找颜色
  },
  {
    to: '/games/shapes',
    emoji: '🔷',
    title: '形状匹配',
    description: '找出相同的形状',
    theme: 'lavender' as const,
    character: '🐱', // 辅助角色 - 小猫玩积木
  },
]

export function GameGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {games.map((game, index) => (
        <GameCard
          key={game.to}
          {...game}
          index={index}
        />
      ))}
    </div>
  )
}
