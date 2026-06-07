import { clamp } from '@kawuxing/shared'

export const BEHAVIOR_SCORE_MIN = 0
export const BEHAVIOR_SCORE_MAX = 100
export const BEHAVIOR_SCORE_CENTER = 50

export const BEHAVIOR_DELTA = {
  QUESTION_TILE_SWAP: +6,
  DENY_SLOW_PONG: +4,
  DENY_UNDO: +4,
  REQUIRE_ORIGINAL_RETURN: +10,
  ADVANCE_DRAW: 0,
  ADVANCE_PEEK_NO_LOOK: 0,
  ADVANCE_PEEK_LOOK: -2,
  ADVANCE_LEAK: 0,
  TRY_SWAP: -5,
  SWAP_CAUGHT_EXTRA: -5,
  REQUEST_UNDO: -4,
} as const

export function applyBehaviorDelta(current: number, delta: number): number {
  return clamp(current + delta, BEHAVIOR_SCORE_MIN, BEHAVIOR_SCORE_MAX)
}
