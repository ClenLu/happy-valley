// 贝塞尔曲线工具 - 用于气球飞天轨迹

export interface Point {
  x: number
  y: number
}

/**
 * 二次贝塞尔曲线
 * P(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
 */
export function quadraticBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  t: number
): Point {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t

  return {
    x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
    y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y,
  }
}

/**
 * 三次贝塞尔曲线
 * P(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
 */
export function cubicBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): Point {
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  const t2 = t * t
  const t3 = t2 * t

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  }
}

/**
 * 计算气球飞向星星的曲线
 * 创建一个优美的向上弧线
 */
export function createFlyToStarPath(
  start: Point,
  end: Point
): { getPoint: (t: number) => Point } {
  // 控制点：在起点和终点之间创建一个优美的弧线
  // 控制点偏向起点上方，创造先快后慢的抛物线效果
  const midX = (start.x + end.x) / 2
  const midY = Math.min(start.y, end.y) - 100 // 弧线的最高点

  // 左控制点：靠近起点上方
  const cp1: Point = {
    x: start.x + (midX - start.x) * 0.3,
    y: start.y - (start.y - midY) * 0.6,
  }

  // 右控制点：靠近终点
  const cp2: Point = {
    x: end.x - (end.x - midX) * 0.3,
    y: end.y + (midY - end.y) * 0.2,
  }

  return {
    getPoint: (t: number) => cubicBezier(start, cp1, cp2, end, t),
  }
}

/**
 * 计算曲线上某点的切线方向（用于旋转气球）
 */
export function getTangentAngle(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): number {
  // 三次贝塞尔曲线的导数
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t

  const dx = 3 * mt2 * (p1.x - p0.x) +
             6 * mt * t * (p2.x - p1.x) +
             3 * t2 * (p3.x - p2.x)

  const dy = 3 * mt2 * (p1.y - p0.y) +
             6 * mt * t * (p2.y - p1.y) +
             3 * t2 * (p3.y - p2.y)

  return Math.atan2(dy, dx)
}
