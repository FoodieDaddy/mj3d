export interface PlayerJoinedEvent {
  type: 'PLAYER_JOINED'
  roomId: string
  gameId: string
  playerId: string
}

export interface PlayerLeftEvent {
  type: 'PLAYER_LEFT'
  roomId: string
  gameId: string
  playerId: string
}

export interface BotFilledEvent {
  type: 'BOT_FILLED'
  roomId: string
  gameId: string
  playerId: string
}

export interface TileDrawnEvent {
  type: 'TILE_DRAWN'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
  advanced: boolean
}

export interface AdvancedTilePeekedEvent {
  type: 'ADVANCED_TILE_PEEKED'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
}

export interface TileLeakedEvent {
  type: 'TILE_LEAKED'
  roomId: string
  gameId: string
  playerId: string
  viewerId: string
  tileId: string
}

export interface TilePutInHandEvent {
  type: 'TILE_PUT_IN_HAND'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
}

export interface TileDiscardedEvent {
  type: 'TILE_DISCARDED'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
}

export interface UndoRequestedEvent {
  type: 'UNDO_REQUESTED'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
}

export interface UndoAcceptedEvent {
  type: 'UNDO_ACCEPTED'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
}

export interface UndoDeniedEvent {
  type: 'UNDO_DENIED'
  roomId: string
  gameId: string
  playerId: string
  tileId: string
}

export interface BehaviorScoreChangedEvent {
  type: 'BEHAVIOR_SCORE_CHANGED'
  roomId: string
  gameId: string
  playerId: string
  delta: number
  reason: string
}

export interface PlayerUrgedEvent {
  type: 'PLAYER_URGED'
  roomId: string
  gameId: string
  playerId: string
  targetPlayerId: string
}

export interface HandShownEvent {
  type: 'HAND_SHOWN'
  roomId: string
  gameId: string
  playerId: string
}

export interface WinDeclaredEvent {
  type: 'WIN_DECLARED'
  roomId: string
  gameId: string
  playerId: string
}

export interface ResponseWindowOpenedEvent {
  type: 'RESPONSE_WINDOW_OPENED'
  roomId: string
  gameId: string
  discardTileId: string
  discardPlayerId: string
  eligiblePlayerIds: string[]
}

export interface ResponseWindowClosedEvent {
  type: 'RESPONSE_WINDOW_CLOSED'
  roomId: string
  gameId: string
  pongPlayerId: string | null
}

export type GameEvent =
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | BotFilledEvent
  | TileDrawnEvent
  | AdvancedTilePeekedEvent
  | TileLeakedEvent
  | TilePutInHandEvent
  | TileDiscardedEvent
  | UndoRequestedEvent
  | UndoAcceptedEvent
  | UndoDeniedEvent
  | BehaviorScoreChangedEvent
  | PlayerUrgedEvent
  | HandShownEvent
  | WinDeclaredEvent
  | ResponseWindowOpenedEvent
  | ResponseWindowClosedEvent

export type GameEventType = GameEvent['type']
