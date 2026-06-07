import type { Tile } from '@kawuxing/protocol'

const SUITS = ['wan', 'tiao', 'tong'] as const
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function createTileSet(): Tile[] {
  const tiles: Tile[] = []
  let id = 0

  for (const suit of SUITS) {
    for (const value of VALUES) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push({
          id: `tile_${String(id).padStart(3, '0')}`,
          suit,
          value,
        })
        id++
      }
    }
  }

  return tiles
}

export function shuffleTiles(tiles: Tile[], seed?: number): Tile[] {
  const shuffled = [...tiles]
  let s = seed ?? Math.floor(Math.random() * 2147483647)
  function random() {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function isSameTile(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value
}
