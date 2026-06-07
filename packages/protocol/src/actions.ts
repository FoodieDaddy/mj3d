import { z } from 'zod'

// --- Zod Schemas ---

export const RoomJoinActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('ROOM_JOIN'),
  payload: z.object({
    playerName: z.string().optional(),
  }),
})

export const DrawTileActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('DRAW_TILE'),
  payload: z.object({
    advance: z.boolean(),
  }),
})

export const PeekAdvancedTileActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('PEEK_ADVANCED_TILE'),
  payload: z.object({}),
})

export const PutTileInHandActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('PUT_TILE_IN_HAND'),
  payload: z.object({
    tileId: z.string(),
  }),
})

export const DiscardTileActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('DISCARD_TILE'),
  payload: z.object({
    tileId: z.string(),
  }),
})

export const RequestUndoDiscardActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('REQUEST_UNDO_DISCARD'),
  payload: z.object({
    tileId: z.string(),
  }),
})

export const AllowUndoActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('ALLOW_UNDO'),
  payload: z.object({
    targetPlayerId: z.string(),
  }),
})

export const DenyUndoActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('DENY_UNDO'),
  payload: z.object({
    targetPlayerId: z.string(),
  }),
})

export const ClaimPongActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('CLAIM_PONG'),
  payload: z.object({
    tileId: z.string(),
  }),
})

export const ClaimKongActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('CLAIM_KONG'),
  payload: z.object({
    tileId: z.string(),
  }),
})

export const ClaimWinActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('CLAIM_WIN'),
  payload: z.object({
    tileId: z.string().optional(),
  }),
})

export const PassActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('PASS'),
  payload: z.object({}),
})

export const ShowHandActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('SHOW_HAND'),
  payload: z.object({}),
})

export const UrgePlayerActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('URGE_PLAYER'),
  payload: z.object({
    targetPlayerId: z.string(),
  }),
})

export const QuestionTileSwapActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('QUESTION_TILE_SWAP'),
  payload: z.object({
    targetPlayerId: z.string(),
  }),
})

export const RequireOriginalReturnActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('REQUIRE_ORIGINAL_RETURN'),
  payload: z.object({
    targetPlayerId: z.string(),
  }),
})

export const TrySwapReturnTileActionSchema = z.object({
  protocolVersion: z.literal(1),
  actionId: z.string().uuid(),
  roomId: z.string(),
  playerId: z.string(),
  type: z.literal('TRY_SWAP_RETURN_TILE'),
  payload: z.object({
    tileId: z.string(),
  }),
})

// --- TypeScript Types ---

export type RoomJoinAction = z.infer<typeof RoomJoinActionSchema>
export type DrawTileAction = z.infer<typeof DrawTileActionSchema>
export type PeekAdvancedTileAction = z.infer<typeof PeekAdvancedTileActionSchema>
export type PutTileInHandAction = z.infer<typeof PutTileInHandActionSchema>
export type DiscardTileAction = z.infer<typeof DiscardTileActionSchema>
export type RequestUndoDiscardAction = z.infer<typeof RequestUndoDiscardActionSchema>
export type AllowUndoAction = z.infer<typeof AllowUndoActionSchema>
export type DenyUndoAction = z.infer<typeof DenyUndoActionSchema>
export type ClaimPongAction = z.infer<typeof ClaimPongActionSchema>
export type ClaimKongAction = z.infer<typeof ClaimKongActionSchema>
export type ClaimWinAction = z.infer<typeof ClaimWinActionSchema>
export type PassAction = z.infer<typeof PassActionSchema>
export type ShowHandAction = z.infer<typeof ShowHandActionSchema>
export type UrgePlayerAction = z.infer<typeof UrgePlayerActionSchema>
export type QuestionTileSwapAction = z.infer<typeof QuestionTileSwapActionSchema>
export type RequireOriginalReturnAction = z.infer<typeof RequireOriginalReturnActionSchema>
export type TrySwapReturnTileAction = z.infer<typeof TrySwapReturnTileActionSchema>

export type ClientAction =
  | RoomJoinAction
  | DrawTileAction
  | PeekAdvancedTileAction
  | PutTileInHandAction
  | DiscardTileAction
  | RequestUndoDiscardAction
  | AllowUndoAction
  | DenyUndoAction
  | ClaimPongAction
  | ClaimKongAction
  | ClaimWinAction
  | PassAction
  | ShowHandAction
  | UrgePlayerAction
  | QuestionTileSwapAction
  | RequireOriginalReturnAction
  | TrySwapReturnTileAction

export type ClientActionType = ClientAction['type']

export const ClientActionSchemas = {
  ROOM_JOIN: RoomJoinActionSchema,
  DRAW_TILE: DrawTileActionSchema,
  PEEK_ADVANCED_TILE: PeekAdvancedTileActionSchema,
  PUT_TILE_IN_HAND: PutTileInHandActionSchema,
  DISCARD_TILE: DiscardTileActionSchema,
  REQUEST_UNDO_DISCARD: RequestUndoDiscardActionSchema,
  ALLOW_UNDO: AllowUndoActionSchema,
  DENY_UNDO: DenyUndoActionSchema,
  CLAIM_PONG: ClaimPongActionSchema,
  CLAIM_KONG: ClaimKongActionSchema,
  CLAIM_WIN: ClaimWinActionSchema,
  PASS: PassActionSchema,
  SHOW_HAND: ShowHandActionSchema,
  URGE_PLAYER: UrgePlayerActionSchema,
  QUESTION_TILE_SWAP: QuestionTileSwapActionSchema,
  REQUIRE_ORIGINAL_RETURN: RequireOriginalReturnActionSchema,
  TRY_SWAP_RETURN_TILE: TrySwapReturnTileActionSchema,
} as const
