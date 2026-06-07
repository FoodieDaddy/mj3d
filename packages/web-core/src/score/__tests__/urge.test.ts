import { describe, it, expect } from 'vitest'
import { getUrgeDelta } from '../urge'

describe('urge', () => {
  it('1st urge: -1', () => {
    expect(getUrgeDelta(1)).toBe(-1)
  })

  it('2nd urge: 0', () => {
    expect(getUrgeDelta(2)).toBe(0)
  })

  it('3rd urge: +1', () => {
    expect(getUrgeDelta(3)).toBe(1)
  })

  it('4th urge: +2', () => {
    expect(getUrgeDelta(4)).toBe(2)
  })

  it('5th urge: +4', () => {
    expect(getUrgeDelta(5)).toBe(4)
  })

  it('6th urge: +6', () => {
    expect(getUrgeDelta(6)).toBe(6)
  })

  it('7th urge: +6', () => {
    expect(getUrgeDelta(7)).toBe(6)
  })

  it('10th urge: +6', () => {
    expect(getUrgeDelta(10)).toBe(6)
  })
})
