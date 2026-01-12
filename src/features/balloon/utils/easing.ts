// 缓动函数库 - 用于创建流畅的动画效果

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 限制值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ============ 基础缓动函数 ============

/**
 * 缓入 - 慢启动
 */
export function easeIn(t: number): number {
  return t * t
}

/**
 * 缓出 - 慢结束
 */
export function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

/**
 * 缓入缓出 - 慢启动慢结束
 */
export function easeInOut(t: number): number {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// ============ 弹性缓动 ============

/**
 * 弹性缓出 - 弹跳效果
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

/**
 * 回弹缓出 - 先超过再回弹
 */
export function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/**
 * 挤压拉伸效果 - 用于蓄力动画
 * t: 0-0.3 挤压，0.3-0.6 拉伸，0.6-1.0 恢复
 */
export function squashStretch(t: number): number {
  if (t < 0.2) {
    // 挤压：scale 从 1 降到 0.85
    return 1 - 0.15 * easeOut(t / 0.2)
  } else if (t < 0.5) {
    // 拉伸：scale 从 0.85 升到 1.2
    return 0.85 + 0.35 * easeOut((t - 0.2) / 0.3)
  } else {
    // 恢复：scale 从 1.2 回到 1.0
    return 1.2 - 0.2 * easeInOut((t - 0.5) / 0.5)
  }
}

// ============ 弧线运动 ============

/**
 * 正弦弧线 - 用于躲避动画的平滑偏移
 */
export function sineArc(t: number): number {
  return Math.sin(t * Math.PI)
}

/**
 * 呼吸效果 - 用于闪烁/脉冲
 */
export function breathe(t: number, frequency: number = 1): number {
  return (Math.sin(t * Math.PI * 2 * frequency) + 1) / 2
}

// ============ 组合效果 ============

/**
 * 预备动作 + 发射
 * 先往回缩，再快速发射
 */
export function anticipateAndLaunch(t: number): number {
  if (t < 0.15) {
    // 预备：往回缩 10%
    return -0.1 * easeOut(t / 0.15)
  } else {
    // 发射：从 -0.1 到 1.0
    return -0.1 + 1.1 * easeOut((t - 0.15) / 0.85)
  }
}

/**
 * 飞天曲线 - 气球飞向星星
 * 结合垂直和水平的弧线运动
 */
export function flyToStarProgress(t: number): { x: number; y: number; scale: number; alpha: number } {
  // 垂直方向：先慢后快往上
  const y = easeIn(t)

  // 水平方向：线性插值即可
  const x = t

  // 缩放：从 1 逐渐缩小到 0.3
  const scale = 1 - 0.7 * easeIn(t)

  // 透明度：前 70% 不变，后 30% 渐隐
  const alpha = t < 0.7 ? 1 : 1 - easeIn((t - 0.7) / 0.3)

  return { x, y, scale, alpha }
}

/**
 * 躲避曲线 - 气球调皮躲开
 */
export function dodgeProgress(t: number): { offset: number; scale: number; rotation: number } {
  if (t < 0.15) {
    // 受惊膨胀
    return {
      offset: 0,
      scale: 1 + 0.15 * easeOut(t / 0.15),
      rotation: 0,
    }
  } else if (t < 0.5) {
    // 快速闪避
    const p = (t - 0.15) / 0.35
    return {
      offset: easeOut(p),
      scale: 1.15 - 0.15 * p,
      rotation: 15 * easeOut(p),
    }
  } else {
    // 缓慢恢复
    const p = (t - 0.5) / 0.5
    return {
      offset: 1 - 0.3 * easeInOut(p), // 不完全回到原位
      scale: 1,
      rotation: 15 * (1 - easeInOut(p)),
    }
  }
}
