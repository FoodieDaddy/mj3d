import { describe, it, expect } from 'vitest'
import {
  createGameState,
  addPlayer,
  startGame,
  drawTile,
  discardTile,
  putTileInHand,
  advanceTurn,
  getPlayerBySeat,
  getPlayerById,
  canPong,
  applyUrge,
} from '../game-state-manager'

describe('game-state-manager', () => {
  function createTestGame() {
    const state = createGameState('main', 'game_001')
    addPlayer(state, 'p1', 'Player 1', 'human')
    addPlayer(state, 'p2', 'Player 2', 'bot', 'normal')
    addPlayer(state, 'p3', 'Player 3', 'bot', 'fast')
    startGame(state)
    return state
  }

  describe('createGameState', () => {
    it('should create empty game state', () => {
      const state = createGameState('main', 'game_001')
      expect(state.roomId).toBe('main')
      expect(state.gameId).toBe('game_001')
      expect(state.players).toEqual([])
      expect(state.isGameOver).toBe(false)
    })
  })

  describe('addPlayer', () => {
    it('should add up to 3 players', () => {
      const state = createGameState('main', 'game_001')
      expect(addPlayer(state, 'p1', 'A', 'human')).toBeTruthy()
      expect(addPlayer(state, 'p2', 'B', 'bot')).toBeTruthy()
      expect(addPlayer(state, 'p3', 'C', 'bot')).toBeTruthy()
      expect(state.players.length).toBe(3)
    })

    it('should reject 4th player', () => {
      const state = createGameState('main', 'game_001')
      addPlayer(state, 'p1', 'A', 'human')
      addPlayer(state, 'p2', 'B', 'bot')
      addPlayer(state, 'p3', 'C', 'bot')
      expect(addPlayer(state, 'p4', 'D', 'human')).toBeNull()
    })
  })

  describe('startGame', () => {
    it('should deal 13 tiles to each player', () => {
      const state = createTestGame()
      for (const player of state.players) {
        expect(player.handTiles.length).toBe(13)
      }
    })

    it('should leave remaining tiles in wall', () => {
      const state = createTestGame()
      expect(state.wallTiles.length).toBe(108 - 39) // 108 - 3*13
    })
  })

  describe('drawTile', () => {
    it('should draw from wall', () => {
      const state = createTestGame()
      const wallCount = state.wallTiles.length
      const tile = drawTile(state, 0)
      expect(tile).toBeTruthy()
      expect(state.wallTiles.length).toBe(wallCount - 1)
    })

    it('should return null when wall is empty', () => {
      const state = createTestGame()
      state.wallTiles = []
      expect(drawTile(state, 0)).toBeNull()
    })
  })

  describe('discardTile', () => {
    it('should move tile from hand to discarded', () => {
      const state = createTestGame()
      const player = getPlayerBySeat(state, 0)!
      const tileId = player.handTiles[0].id
      const tile = discardTile(state, 0, tileId)
      expect(tile).toBeTruthy()
      expect(player.handTiles.length).toBe(12)
      expect(player.discardedTiles.length).toBe(1)
    })

    it('should return null for invalid tile', () => {
      const state = createTestGame()
      expect(discardTile(state, 0, 'nonexistent')).toBeNull()
    })
  })

  describe('advanceTurn', () => {
    it('should cycle through seats', () => {
      const state = createTestGame()
      expect(state.currentTurnSeatId).toBe(0)
      advanceTurn(state)
      expect(state.currentTurnSeatId).toBe(1)
      advanceTurn(state)
      expect(state.currentTurnSeatId).toBe(2)
      advanceTurn(state)
      expect(state.currentTurnSeatId).toBe(0)
    })
  })

  describe('getPlayerBySeat / getPlayerById', () => {
    it('should find player by seat', () => {
      const state = createTestGame()
      const player = getPlayerBySeat(state, 0)
      expect(player?.playerId).toBe('p1')
    })

    it('should find player by id', () => {
      const state = createTestGame()
      const player = getPlayerById(state, 'p2')
      expect(player?.seatId).toBe(1)
    })
  })

  describe('applyUrge', () => {
    it('should increase urge count and change behavior score', () => {
      const state = createTestGame()
      const scoreBefore = getPlayerById(state, 'p1')!.behaviorScore
      const delta = applyUrge(state, 'p1')
      const scoreAfter = getPlayerById(state, 'p1')!.behaviorScore
      expect(getPlayerById(state, 'p1')!.urgeCount).toBe(1)
      expect(delta).toBe(-1) // First urge
      expect(scoreAfter).toBe(scoreBefore - 1)
    })
  })
})
