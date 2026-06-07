import { describe, it, expect } from 'vitest'
import { applyBehaviorDelta, BEHAVIOR_SCORE_MIN, BEHAVIOR_SCORE_MAX, BEHAVIOR_DELTA } from '../behavior-score'

describe('behavior-score', () => {
  describe('applyBehaviorDelta', () => {
    it('should apply positive delta', () => {
      expect(applyBehaviorDelta(50, 6)).toBe(56)
    })

    it('should apply negative delta', () => {
      expect(applyBehaviorDelta(50, -4)).toBe(46)
    })

    it('should clamp to MIN', () => {
      expect(applyBehaviorDelta(2, -10)).toBe(BEHAVIOR_SCORE_MIN)
    })

    it('should clamp to MAX', () => {
      expect(applyBehaviorDelta(98, 10)).toBe(BEHAVIOR_SCORE_MAX)
    })

    it('should handle zero delta', () => {
      expect(applyBehaviorDelta(50, 0)).toBe(50)
    })
  })

  describe('BEHAVIOR_DELTA constants', () => {
    it('QUESTION_TILE_SWAP should be +6', () => {
      expect(BEHAVIOR_DELTA.QUESTION_TILE_SWAP).toBe(6)
    })

    it('DENY_SLOW_PONG should be +4', () => {
      expect(BEHAVIOR_DELTA.DENY_SLOW_PONG).toBe(4)
    })

    it('DENY_UNDO should be +4', () => {
      expect(BEHAVIOR_DELTA.DENY_UNDO).toBe(4)
    })

    it('REQUIRE_ORIGINAL_RETURN should be +10', () => {
      expect(BEHAVIOR_DELTA.REQUIRE_ORIGINAL_RETURN).toBe(10)
    })

    it('ADVANCE_DRAW should be 0', () => {
      expect(BEHAVIOR_DELTA.ADVANCE_DRAW).toBe(0)
    })

    it('ADVANCE_PEEK_LOOK should be -2', () => {
      expect(BEHAVIOR_DELTA.ADVANCE_PEEK_LOOK).toBe(-2)
    })

    it('TRY_SWAP should be -5', () => {
      expect(BEHAVIOR_DELTA.TRY_SWAP).toBe(-5)
    })

    it('SWAP_CAUGHT_EXTRA should be -5', () => {
      expect(BEHAVIOR_DELTA.SWAP_CAUGHT_EXTRA).toBe(-5)
    })

    it('REQUEST_UNDO should be -4', () => {
      expect(BEHAVIOR_DELTA.REQUEST_UNDO).toBe(-4)
    })
  })
})
