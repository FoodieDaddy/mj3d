import { describe, it, expect } from 'vitest'
import {
  RoomJoinActionSchema,
  DrawTileActionSchema,
  DiscardTileActionSchema,
  ClaimPongActionSchema,
  PassActionSchema,
  ShowHandActionSchema,
  UrgePlayerActionSchema,
} from '../actions'

describe('ClientAction schemas', () => {
  const base = {
    protocolVersion: 1 as const,
    actionId: '550e8400-e29b-41d4-a716-446655440000',
    roomId: 'main',
    playerId: 'guest_001',
  }

  describe('ROOM_JOIN', () => {
    it('should validate with optional playerName', () => {
      const result = RoomJoinActionSchema.safeParse({
        ...base,
        type: 'ROOM_JOIN',
        payload: { playerName: 'TestPlayer' },
      })
      expect(result.success).toBe(true)
    })

    it('should validate without playerName', () => {
      const result = RoomJoinActionSchema.safeParse({
        ...base,
        type: 'ROOM_JOIN',
        payload: {},
      })
      expect(result.success).toBe(true)
    })
  })

  describe('DRAW_TILE', () => {
    it('should validate with advance true', () => {
      const result = DrawTileActionSchema.safeParse({
        ...base,
        type: 'DRAW_TILE',
        payload: { advance: true },
      })
      expect(result.success).toBe(true)
    })

    it('should validate with advance false', () => {
      const result = DrawTileActionSchema.safeParse({
        ...base,
        type: 'DRAW_TILE',
        payload: { advance: false },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('DISCARD_TILE', () => {
    it('should validate', () => {
      const result = DiscardTileActionSchema.safeParse({
        ...base,
        type: 'DISCARD_TILE',
        payload: { tileId: 'tile_038' },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('CLAIM_PONG', () => {
    it('should validate', () => {
      const result = ClaimPongActionSchema.safeParse({
        ...base,
        type: 'CLAIM_PONG',
        payload: { tileId: 'tile_038' },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('PASS', () => {
    it('should validate', () => {
      const result = PassActionSchema.safeParse({
        ...base,
        type: 'PASS',
        payload: {},
      })
      expect(result.success).toBe(true)
    })
  })

  describe('SHOW_HAND', () => {
    it('should validate', () => {
      const result = ShowHandActionSchema.safeParse({
        ...base,
        type: 'SHOW_HAND',
        payload: {},
      })
      expect(result.success).toBe(true)
    })
  })

  describe('URGE_PLAYER', () => {
    it('should validate', () => {
      const result = UrgePlayerActionSchema.safeParse({
        ...base,
        type: 'URGE_PLAYER',
        payload: { targetPlayerId: 'guest_002' },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid data', () => {
    it('should reject missing type', () => {
      const result = RoomJoinActionSchema.safeParse({
        ...base,
        payload: {},
      })
      expect(result.success).toBe(false)
    })

    it('should reject wrong protocolVersion', () => {
      const result = RoomJoinActionSchema.safeParse({
        ...base,
        protocolVersion: 2,
        type: 'ROOM_JOIN',
        payload: {},
      })
      expect(result.success).toBe(false)
    })
  })
})
