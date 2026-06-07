import { describe, it, expect } from 'vitest'
import { getLeakRate, getLeakDirection } from '../leak'

describe('leak', () => {
  describe('getLeakRate', () => {
    it('score 50, not favored: base rate 0.08', () => {
      expect(getLeakRate(50, false)).toBeCloseTo(0.08, 2)
    })

    it('score 50, favored: 0.08 - 0.06 = 0.02, clamped to 0.03', () => {
      expect(getLeakRate(50, true)).toBeCloseTo(0.03, 2)
    })

    it('score 0, not favored: 0.08 + 50*0.005 = 0.33', () => {
      expect(getLeakRate(0, false)).toBeCloseTo(0.33, 2)
    })

    it('score 100, not favored: 0.08 + 50*0.005 = 0.33', () => {
      expect(getLeakRate(100, false)).toBeCloseTo(0.33, 2)
    })

    it('score 0, favored: 0.33 - 0.06 = 0.27', () => {
      expect(getLeakRate(0, true)).toBeCloseTo(0.27, 2)
    })

    it('rate should be clamped to max 0.35', () => {
      // Even at extreme, should not exceed 0.35
      expect(getLeakRate(0, false)).toBeLessThanOrEqual(0.35)
    })

    it('rate should be clamped to min 0.03', () => {
      expect(getLeakRate(50, true)).toBeGreaterThanOrEqual(0.03)
    })
  })

  describe('getLeakDirection', () => {
    it('should return left or right', () => {
      const direction = getLeakDirection()
      expect(['left', 'right']).toContain(direction)
    })
  })
})
