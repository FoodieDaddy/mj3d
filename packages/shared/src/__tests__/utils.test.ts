import { describe, it, expect } from 'vitest'
import { clamp } from '../utils'

describe('utils', () => {
  describe('clamp', () => {
    it('should return value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('should clamp to min', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
    })

    it('should clamp to max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })
})
