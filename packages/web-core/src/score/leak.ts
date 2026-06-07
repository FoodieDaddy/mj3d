import { BEHAVIOR_SCORE_CENTER } from './behavior-score'

export function getLeakRate(behaviorScore: number, isFavored: boolean): number {
  const distance = Math.abs(behaviorScore - BEHAVIOR_SCORE_CENTER)

  let rate = 0.08 + distance * 0.005

  if (isFavored) {
    rate -= 0.06
  }

  return Math.max(0.03, Math.min(rate, 0.35))
}

export function getLeakDirection(): 'left' | 'right' {
  return Math.random() < 0.5 ? 'left' : 'right'
}
