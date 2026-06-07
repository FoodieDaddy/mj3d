import { describe, it, expect } from 'vitest'
import { getUndoFrequencyDelta, getUndoProgressDelta, getUndoDelta } from '../undo'

describe('undo', () => {
  describe('getUndoFrequencyDelta', () => {
    it('1st undo: 0', () => {
      expect(getUndoFrequencyDelta(1)).toBe(0)
    })

    it('2nd undo: -2', () => {
      expect(getUndoFrequencyDelta(2)).toBe(-2)
    })

    it('3rd undo: -5', () => {
      expect(getUndoFrequencyDelta(3)).toBe(-5)
    })

    it('4th undo: -9', () => {
      expect(getUndoFrequencyDelta(4)).toBe(-9)
    })

    it('5th undo: -14', () => {
      expect(getUndoFrequencyDelta(5)).toBe(-14)
    })

    it('6th undo: -14', () => {
      expect(getUndoFrequencyDelta(6)).toBe(-14)
    })
  })

  describe('getUndoProgressDelta', () => {
    it('beforeDraw: 0', () => {
      expect(getUndoProgressDelta('beforeDraw')).toBe(0)
    })

    it('drawing: -2', () => {
      expect(getUndoProgressDelta('drawing')).toBe(-2)
    })

    it('inHand: -4', () => {
      expect(getUndoProgressDelta('inHand')).toBe(-4)
    })

    it('discarded: null (不可撤)', () => {
      expect(getUndoProgressDelta('discarded')).toBeNull()
    })
  })

  describe('getUndoDelta', () => {
    it('1st undo, beforeDraw: -4 + 0 + 0 = -4', () => {
      expect(getUndoDelta(1, 'beforeDraw')).toBe(-4)
    })

    it('1st undo, drawing: -4 + 0 + (-2) = -6', () => {
      expect(getUndoDelta(1, 'drawing')).toBe(-6)
    })

    it('1st undo, inHand: -4 + 0 + (-4) = -8', () => {
      expect(getUndoDelta(1, 'inHand')).toBe(-8)
    })

    it('2nd undo, beforeDraw: -4 + (-2) + 0 = -6', () => {
      expect(getUndoDelta(2, 'beforeDraw')).toBe(-6)
    })

    it('discarded: null (不可撤)', () => {
      expect(getUndoDelta(1, 'discarded')).toBeNull()
    })

    it('3rd undo, drawing: -4 + (-5) + (-2) = -11', () => {
      expect(getUndoDelta(3, 'drawing')).toBe(-11)
    })
  })
})
