export const LEVEL_THRESHOLDS = [
  0, 500, 1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000,
  13000, 15500, 18500, 22000, 26000,
] as const

export function getLevelFromXp(totalXp: number) {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
    } else {
      break
    }
  }
  return level
}

export function getXpForNextLevel(level: number) {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] ?? 0
}

export function getLevelSummary(totalXp: number) {
  const level = getLevelFromXp(totalXp)
  const currentLevelStart = LEVEL_THRESHOLDS[Math.max(level - 2, 0)] ?? 0
  const nextLevelStart = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0
  const xpForCurrentLevel = Math.max(totalXp - currentLevelStart, 0)
  const xpForNextLevel = Math.max(nextLevelStart - currentLevelStart, 0)
  const progress = xpForNextLevel > 0 ? (xpForCurrentLevel / xpForNextLevel) * 100 : 100

  return {
    level,
    totalXp,
    currentLevelXp: xpForCurrentLevel,
    xpForNextLevel: xpForNextLevel,
    progress,
  }
}
