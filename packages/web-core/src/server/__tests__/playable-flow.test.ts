import { describe, it, expect, vi } from 'vitest'
import { LocalTransport } from '../../transport/local-transport'
import type { ClientAction, GameState, GameEvent } from '@kawuxing/protocol'

function createTestAction(type: string, playerId: string, payload: Record<string, unknown> = {}): ClientAction {
  return {
    protocolVersion: 1,
    actionId: crypto.randomUUID(),
    roomId: 'main',
    playerId,
    type,
    payload,
  } as ClientAction
}

describe('playable-flow smoke test', () => {
  function setupGame() {
    const transport = new LocalTransport()
    let currentState: GameState | null = null
    const events: GameEvent[] = []

    transport.onState((state) => {
      currentState = state
    })
    transport.onEvent((event) => {
      events.push(event)
    })

    // Join game
    transport.send(createTestAction('ROOM_JOIN', '', { playerName: '测试玩家' }))

    // Get human player id
    const humanPlayer = currentState!.players.find(p => p.playerType === 'human')!
    expect(humanPlayer).toBeTruthy()

    return { transport, getState: () => currentState!, getEvents: () => events, humanPlayerId: humanPlayer.playerId }
  }

  it('should start with 13 hand tiles', () => {
    const { getState, humanPlayerId } = setupGame()
    const state = getState()
    const player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.handTiles.length).toBe(13)
    expect(state.wallTiles.length).toBe(108 - 39)
  })

  it('should draw tile to reach 14 hand tiles', () => {
    const { transport, getState, humanPlayerId } = setupGame()
    const state = getState()

    // It should be human's turn (seat 0)
    expect(state.currentTurnSeatId).toBe(0)
    expect(state.nextPlayerStage).toBe('beforeDraw')

    // Draw tile
    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: false }))

    const afterDraw = getState()
    const player = afterDraw.players.find(p => p.playerId === humanPlayerId)!
    expect(player.handTiles.length).toBe(14)
    expect(afterDraw.nextPlayerStage).toBe('inHand')
    expect(afterDraw.wallTiles.length).toBe(108 - 39 - 1)
  })

  it('should discard tile to return to 13 hand tiles', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    // Draw
    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: false }))
    const afterDraw = getState()
    const player = afterDraw.players.find(p => p.playerId === humanPlayerId)!
    expect(player.handTiles.length).toBe(14)

    // Select and discard the last tile
    const tileToDiscard = player.handTiles[player.handTiles.length - 1]
    transport.send(createTestAction('DISCARD_TILE', humanPlayerId, { tileId: tileToDiscard.id }))

    const afterDiscard = getState()
    const playerAfter = afterDiscard.players.find(p => p.playerId === humanPlayerId)!
    expect(playerAfter.handTiles.length).toBe(13)
    expect(playerAfter.discardedTiles.length).toBe(1)
  })

  it('should run multiple draw-discard cycles', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { transport, getState, humanPlayerId } = setupGame()

    // Verify we can complete at least one draw-discard cycle
    // Draw
    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: false }))

    const afterDraw = getState()
    const player = afterDraw.players.find(p => p.playerId === humanPlayerId)!
    expect(player.handTiles.length).toBe(14)

    // Discard
    transport.send(createTestAction('DISCARD_TILE', humanPlayerId, { tileId: player.handTiles[0].id }))

    const afterDiscard = getState()
    // Response window may have already resolved if no one is eligible
    // or it may still be open
    if (afterDiscard.nextPlayerStage === 'responseWindow' && afterDiscard.responseWindow) {
      // Pass if eligible
      const rw = afterDiscard.responseWindow
      if (rw.eligiblePlayerIds.includes(humanPlayerId) && rw.responses[humanPlayerId] === null) {
        transport.send(createTestAction('PASS', humanPlayerId, {}))
      }
      // Advance timers to let bots respond and window resolve
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(500)
        const s = getState()
        if (s.nextPlayerStage !== 'responseWindow') break
      }
    }

    const afterResolution = getState()
    // Response window should be resolved and turn should advance
    expect(afterResolution.responseWindow).toBeNull()
    // Discard should have happened
    const humanPlayer = afterResolution.players.find(p => p.playerId === humanPlayerId)!
    expect(humanPlayer.discardedTiles.length).toBe(1)

    vi.useRealTimers()
  })

  it('should advance draw tile to advancedTile', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: true }))

    const state = getState()
    const player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.advancedTile).toBeTruthy()
    expect(player.handTiles.length).toBe(13) // unchanged
    expect(state.nextPlayerStage).toBe('inHand')
  })

  it('should put advanced tile in hand', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: true }))
    const afterDraw = getState()
    const player = afterDraw.players.find(p => p.playerId === humanPlayerId)!
    const advancedTileId = player.advancedTile!.id

    transport.send(createTestAction('PUT_TILE_IN_HAND', humanPlayerId, { tileId: advancedTileId }))

    const afterPut = getState()
    const playerAfter = afterPut.players.find(p => p.playerId === humanPlayerId)!
    expect(playerAfter.advancedTile).toBeNull()
    expect(playerAfter.handTiles.length).toBe(14)
  })

  it('should reject discard when advancedTile exists', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: true }))
    const afterDraw = getState()
    const player = afterDraw.players.find(p => p.playerId === humanPlayerId)!
    const advancedTileId = player.advancedTile!.id

    // 尝试直接出 advancedTile — 应被拒绝
    transport.send(createTestAction('DISCARD_TILE', humanPlayerId, { tileId: advancedTileId }))

    const afterAttempt = getState()
    const playerAfter = afterAttempt.players.find(p => p.playerId === humanPlayerId)!
    expect(playerAfter.advancedTile).toBeTruthy() // advancedTile 仍在
    expect(playerAfter.handTiles.length).toBe(13) // 手牌不变
    expect(playerAfter.discardedTiles.length).toBe(0) // 没有出牌
  })

  it('should allow discard after PUT_TILE_IN_HAND', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: true }))
    let state = getState()
    let player = state.players.find(p => p.playerId === humanPlayerId)!
    const advancedTileId = player.advancedTile!.id

    // 先放入手牌
    transport.send(createTestAction('PUT_TILE_IN_HAND', humanPlayerId, { tileId: advancedTileId }))
    state = getState()
    player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.advancedTile).toBeNull()
    expect(player.handTiles.length).toBe(14)

    // 现在可以出牌
    const tileToDiscard = player.handTiles[player.handTiles.length - 1]
    transport.send(createTestAction('DISCARD_TILE', humanPlayerId, { tileId: tileToDiscard.id }))

    state = getState()
    player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.handTiles.length).toBe(13)
    expect(player.discardedTiles.length).toBe(1)
  })

  it('peek deducts -2 behavior score', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: true }))
    let state = getState()
    let player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.behaviorScore).toBe(50)

    transport.send(createTestAction('PEEK_ADVANCED_TILE', humanPlayerId, {}))
    state = getState()
    player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.behaviorScore).toBe(48)
    expect(player.hasPeekedAdvanced).toBe(true)
  })

  it('no-peek does not deduct behavior score', () => {
    const { transport, getState, humanPlayerId } = setupGame()

    transport.send(createTestAction('DRAW_TILE', humanPlayerId, { advance: true }))
    let state = getState()
    let player = state.players.find(p => p.playerId === humanPlayerId)!
    const advancedTileId = player.advancedTile!.id

    // 不看牌，直接放入手牌
    transport.send(createTestAction('PUT_TILE_IN_HAND', humanPlayerId, { tileId: advancedTileId }))
    state = getState()
    player = state.players.find(p => p.playerId === humanPlayerId)!
    expect(player.behaviorScore).toBe(50) // 不变
  })
})
