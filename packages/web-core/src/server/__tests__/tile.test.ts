import { describe, it, expect } from 'vitest'
import { createTileSet, shuffleTiles, isSameTile } from '../tile'

describe('tile', () => {
  describe('createTileSet', () => {
    it('should create 108 tiles (3 suits * 9 values * 4 copies)', () => {
      const tiles = createTileSet()
      expect(tiles.length).toBe(108)
    })

    it('should have unique ids', () => {
      const tiles = createTileSet()
      const ids = new Set(tiles.map((t) => t.id))
      expect(ids.size).toBe(108)
    })

    it('should have 3 suits', () => {
      const tiles = createTileSet()
      const suits = new Set(tiles.map((t) => t.suit))
      expect(suits.size).toBe(3)
      expect(suits).toContain('wan')
      expect(suits).toContain('tiao')
      expect(suits).toContain('tong')
    })
  })

  describe('shuffleTiles', () => {
    it('should return same length', () => {
      const tiles = createTileSet()
      const shuffled = shuffleTiles(tiles)
      expect(shuffled.length).toBe(tiles.length)
    })

    it('should not mutate original', () => {
      const tiles = createTileSet()
      const firstId = tiles[0].id
      shuffleTiles(tiles)
      expect(tiles[0].id).toBe(firstId)
    })
  })

  describe('isSameTile', () => {
    it('should return true for same suit and value', () => {
      expect(isSameTile(
        { id: 'a', suit: 'wan', value: 5 },
        { id: 'b', suit: 'wan', value: 5 },
      )).toBe(true)
    })

    it('should return false for different suit', () => {
      expect(isSameTile(
        { id: 'a', suit: 'wan', value: 5 },
        { id: 'b', suit: 'tiao', value: 5 },
      )).toBe(false)
    })

    it('should return false for different value', () => {
      expect(isSameTile(
        { id: 'a', suit: 'wan', value: 5 },
        { id: 'b', suit: 'wan', value: 3 },
      )).toBe(false)
    })
  })
})
