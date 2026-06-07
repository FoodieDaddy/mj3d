import { describe, it, expect } from 'vitest'
import { getFavorWeight } from '../favor'

describe('favor', () => {
  describe('getFavorWeight', () => {
    it('score 50 (center): weight 100', () => {
      expect(getFavorWeight(50)).toBe(100)
    })

    it('score 40: weight 80', () => {
      expect(getFavorWeight(40)).toBe(80)
    })

    it('score 60: weight 80', () => {
      expect(getFavorWeight(60)).toBe(80)
    })

    it('score 0: weight 5 (clamped)', () => {
      expect(getFavorWeight(0)).toBe(5)
    })

    it('score 100: weight 5 (clamped)', () => {
      expect(getFavorWeight(100)).toBe(5)
    })

    it('score 25: weight 50', () => {
      expect(getFavorWeight(25)).toBe(50)
    })

    it('score 75: weight 50', () => {
      expect(getFavorWeight(75)).toBe(50)
    })
  })
})
