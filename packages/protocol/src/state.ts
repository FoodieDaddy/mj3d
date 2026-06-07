export type SeatId = 0 | 1 | 2

export type PlayerType = 'human' | 'bot'

export type BotStyle = 'normal' | 'fast' | 'loose' | 'strict'

export type NextPlayerStage =
  | 'beforeDraw'
  | 'drawing'
  | 'inHand'
  | 'discarded'
  | 'responseWindow'

export interface ResponseWindow {
  discardTileId: string
  discardTileValue: string
  discardTileSuit: 'wan' | 'tiao' | 'tong'
  discardPlayerId: string
  eligiblePlayerIds: string[]
  deadlineAt: number
  responses: Record<string, 'PONG' | 'PASS' | null>
}

export interface Tile {
  id: string
  suit: 'wan' | 'tiao' | 'tong'
  value: number
}

export interface PlayerState {
  playerId: string
  seatId: SeatId
  playerName: string
  playerType: PlayerType
  botStyle?: BotStyle
  handTiles: Tile[]
  discardedTiles: Tile[]
  meldGroups: MeldGroup[]
  behaviorScore: number
  urgeCount: number
  undoCount: number
  isShowHand: boolean
  advancedTile: Tile | null
  hasPeekedAdvanced: boolean
}

export interface MeldGroup {
  type: 'pong' | 'kong' | 'chow'
  tiles: Tile[]
}

export interface GameState {
  roomId: string
  gameId: string
  players: PlayerState[]
  wallTiles: Tile[]
  currentTurnSeatId: SeatId
  nextPlayerStage: NextPlayerStage
  lastDiscardedTile: Tile | null
  lastDiscardedBy: SeatId | null
  responseWindow: ResponseWindow | null
  isGameOver: boolean
  winnerId: string | null
}
