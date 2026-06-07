import { describe, it, expect } from 'vitest'
import { formatGameEvent } from '../format-event'
import type { GameEvent, PlayerState } from '@kawuxing/protocol'

function makePlayer(id: string, name: string): PlayerState {
  return {
    playerId: id,
    seatId: 0,
    playerName: name,
    playerType: 'human',
    handTiles: [],
    discardedTiles: [],
    meldGroups: [],
    behaviorScore: 50,
    urgeCount: 0,
    undoCount: 0,
    isShowHand: false,
    advancedTile: null,
    hasPeekedAdvanced: false,
  }
}

const players = [
  makePlayer('p1', '玩家A'),
  makePlayer('p2', '电脑B'),
  makePlayer('p3', '电脑C'),
]

describe('formatGameEvent', () => {
  it('formats TILE_DRAWN for self', () => {
    const event: GameEvent = { type: 'TILE_DRAWN', roomId: 'main', gameId: 'g1', playerId: 'p1', tileId: 't1', advanced: false }
    expect(formatGameEvent(event, players, 'p1')).toBe('你 摸了一张牌')
  })

  it('formats TILE_DRAWN for other', () => {
    const event: GameEvent = { type: 'TILE_DRAWN', roomId: 'main', gameId: 'g1', playerId: 'p2', tileId: 't1', advanced: false }
    expect(formatGameEvent(event, players, 'p1')).toBe('电脑B 摸牌')
  })

  it('formats TILE_DISCARDED with tile name', () => {
    const event: GameEvent = { type: 'TILE_DISCARDED', roomId: 'main', gameId: 'g1', playerId: 'p1', tileId: 'tile_003' }
    const result = formatGameEvent(event, players, 'p1')
    expect(result).toMatch(/^你 打出 /)
  })

  it('formats ADVANCED_TILE_PEEKED', () => {
    const event: GameEvent = { type: 'ADVANCED_TILE_PEEKED', roomId: 'main', gameId: 'g1', playerId: 'p1', tileId: 't1' }
    expect(formatGameEvent(event, players, 'p1')).toBe('你 看了提前拿的牌，行为分 -2')
  })

  it('formats PLAYER_URGED', () => {
    const event: GameEvent = { type: 'PLAYER_URGED', roomId: 'main', gameId: 'g1', playerId: 'p2', targetPlayerId: 'p1' }
    expect(formatGameEvent(event, players, 'p1')).toBe('电脑B 催促了你')
  })

  it('formats WIN_DECLARED', () => {
    const event: GameEvent = { type: 'WIN_DECLARED', roomId: 'main', gameId: 'g1', playerId: 'p2' }
    expect(formatGameEvent(event, players, 'p1')).toBe('电脑B 胡牌！')
  })

  it('formats HAND_SHOWN', () => {
    const event: GameEvent = { type: 'HAND_SHOWN', roomId: 'main', gameId: 'g1', playerId: 'p1' }
    expect(formatGameEvent(event, players, 'p1')).toBe('你 亮牌')
  })

  it('formats BEHAVIOR_SCORE_CHANGED', () => {
    const event: GameEvent = { type: 'BEHAVIOR_SCORE_CHANGED', roomId: 'main', gameId: 'g1', playerId: 'p1', delta: -2, reason: 'PEEK' }
    expect(formatGameEvent(event, players, 'p1')).toBe('你 行为分 -2')
  })

  it('formats PLAYER_JOINED', () => {
    const event: GameEvent = { type: 'PLAYER_JOINED', roomId: 'main', gameId: 'g1', playerId: 'p1' }
    expect(formatGameEvent(event, players, 'p1')).toBe('你 加入')
  })

  it('formats BOT_FILLED', () => {
    const event: GameEvent = { type: 'BOT_FILLED', roomId: 'main', gameId: 'g1', playerId: 'p2' }
    expect(formatGameEvent(event, players, 'p1')).toBe('电脑B 补位')
  })

  it('formats TILE_PUT_IN_HAND', () => {
    const event: GameEvent = { type: 'TILE_PUT_IN_HAND', roomId: 'main', gameId: 'g1', playerId: 'p1', tileId: 't1' }
    expect(formatGameEvent(event, players, 'p1')).toBe('你 放入手牌')
  })
})
