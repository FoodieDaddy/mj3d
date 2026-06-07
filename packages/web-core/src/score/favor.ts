import { BEHAVIOR_SCORE_CENTER } from './behavior-score'

export function getFavorWeight(behaviorScore: number): number {
  const distance = Math.abs(behaviorScore - BEHAVIOR_SCORE_CENTER)
  return Math.max(5, 100 - distance * 2)
}

export function isFavored(behaviorScore: number): boolean {
  const weight = getFavorWeight(behaviorScore)
  return Math.random() * 100 < weight
}
