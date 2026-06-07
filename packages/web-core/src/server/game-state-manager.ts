import type {
  GameState,
  PlayerState,
  SeatId,
  Tile,
  BotStyle,
  PlayerType,
} from '@kawuxing/protocol'
import { createTileSet, shuffleTiles } from './tile'
import { applyBehaviorDelta, BEHAVIOR_SCORE_CENTER } from '../score/behavior-score'
import { getUrgeDelta } from '../score/urge'
import { getUndoDelta } from '../score/undo'
import { getLeakRate, getLeakDirection } from '../score/leak'
import { isFavored } from '../score/favor'

const HAND_SIZE = 13

export function createGameState(roomId: string, gameId: string): GameState {
  return {
    roomId,
    gameId,
    players: [],
    wallTiles: [],
    currentTurnSeatId: 0,
    nextPlayerStage: 'beforeDraw',
    lastDiscardedTile: null,
    lastDiscardedBy: null,
    responseWindow: null,
    isGameOver: false,
    winnerId: null,
  }
}

export function addPlayer(
  state: GameState,
  playerId: string,
  playerName: string,
  playerType: PlayerType,
  botStyle?: BotStyle,
): PlayerState | null {
  if (state.players.length >= 3) return null

  const seatId = state.players.length as SeatId
  const player: PlayerState = {
    playerId,
    seatId,
    playerName,
    playerType,
    botStyle,
    handTiles: [],
    discardedTiles: [],
    meldGroups: [],
    behaviorScore: BEHAVIOR_SCORE_CENTER,
    urgeCount: 0,
    undoCount: 0,
    isShowHand: false,
    advancedTile: null,
    hasPeekedAdvanced: false,
  }

  state.players.push(player)
  return player
}

export function startGame(state: GameState, seed?: number): void {
  const allTiles = createTileSet()
  const shuffled = shuffleTiles(allTiles, seed)

  // 13 tiles per player
  for (let i = 0; i < 3; i++) {
    state.players[i].handTiles = shuffled.slice(i * HAND_SIZE, (i + 1) * HAND_SIZE)
  }

  // remaining tiles go to wall
  state.wallTiles = shuffled.slice(3 * HAND_SIZE)
  state.currentTurnSeatId = 0
  state.nextPlayerStage = 'beforeDraw'
}

export function drawTile(state: GameState, _seatId: SeatId): Tile | null {
  if (state.wallTiles.length === 0) return null

  const tile = state.wallTiles.shift()!
  return tile
}

export function discardTile(state: GameState, seatId: SeatId, tileId: string): Tile | null {
  const player = getPlayerBySeat(state, seatId)
  if (!player) return null

  const tileIndex = player.handTiles.findIndex((t) => t.id === tileId)
  if (tileIndex !== -1) {
    const [tile] = player.handTiles.splice(tileIndex, 1)
    player.discardedTiles.push(tile)
    state.lastDiscardedTile = tile
    state.lastDiscardedBy = seatId
    return tile
  }

  return null
}

export function putTileInHand(state: GameState, seatId: SeatId, tile: Tile): void {
  const player = getPlayerBySeat(state, seatId)
  if (!player) return

  player.handTiles.push(tile)
  player.advancedTile = null
  player.hasPeekedAdvanced = false
}

export function advanceTurn(state: GameState): void {
  state.currentTurnSeatId = ((state.currentTurnSeatId + 1) % 3) as SeatId
  state.nextPlayerStage = 'beforeDraw'
}

export function getPlayerBySeat(state: GameState, seatId: SeatId): PlayerState | undefined {
  return state.players.find((p) => p.seatId === seatId)
}

export function getPlayerById(state: GameState, playerId: string): PlayerState | undefined {
  return state.players.find((p) => p.playerId === playerId)
}

export function canPong(state: GameState, playerId: string, _tileId: string): boolean {
  const player = getPlayerById(state, playerId)
  if (!player || !state.lastDiscardedTile) return false

  const matchingCount = player.handTiles.filter(
    (t) => t.suit === state.lastDiscardedTile!.suit && t.value === state.lastDiscardedTile!.value,
  ).length

  return matchingCount >= 2
}

export function canKong(state: GameState, playerId: string, _tileId: string): boolean {
  const player = getPlayerById(state, playerId)
  if (!player || !state.lastDiscardedTile) return false

  const matchingCount = player.handTiles.filter(
    (t) => t.suit === state.lastDiscardedTile!.suit && t.value === state.lastDiscardedTile!.value,
  ).length

  return matchingCount >= 3
}

export function applyUrge(state: GameState, targetPlayerId: string): number {
  const player = getPlayerById(state, targetPlayerId)
  if (!player) return 0

  player.urgeCount++
  const delta = getUrgeDelta(player.urgeCount)
  player.behaviorScore = applyBehaviorDelta(player.behaviorScore, delta)
  return delta
}

export function applyUndoRequest(state: GameState, playerId: string): number | null {
  const player = getPlayerById(state, playerId)
  if (!player) return null

  player.undoCount++
  const delta = getUndoDelta(player.undoCount, state.nextPlayerStage)
  if (delta === null) return null

  player.behaviorScore = applyBehaviorDelta(player.behaviorScore, delta)
  return delta
}

export function openResponseWindow(state: GameState, durationMs: number = 3000): void {
  if (!state.lastDiscardedTile || state.lastDiscardedBy === null) return

  const discardPlayer = getPlayerBySeat(state, state.lastDiscardedBy)
  if (!discardPlayer) return

  const eligiblePlayerIds: string[] = []
  for (const player of state.players) {
    if (player.seatId === state.lastDiscardedBy) continue
    if (canPong(state, player.playerId, state.lastDiscardedTile.id)) {
      eligiblePlayerIds.push(player.playerId)
    }
  }

  const responses: Record<string, 'PONG' | 'PASS' | null> = {}
  for (const pid of eligiblePlayerIds) {
    responses[pid] = null
  }

  state.responseWindow = {
    discardTileId: state.lastDiscardedTile.id,
    discardTileValue: String(state.lastDiscardedTile.value),
    discardTileSuit: state.lastDiscardedTile.suit,
    discardPlayerId: discardPlayer.playerId,
    eligiblePlayerIds,
    deadlineAt: Date.now() + durationMs,
    responses,
  }

  state.nextPlayerStage = 'responseWindow'
}

export function isResponseWindowResolved(state: GameState): boolean {
  if (!state.responseWindow) return true
  const { eligiblePlayerIds, responses } = state.responseWindow
  return eligiblePlayerIds.every((pid) => responses[pid] !== null)
}

export function resolveResponseWindow(state: GameState): string | null {
  if (!state.responseWindow) return null

  const { responses } = state.responseWindow
  let pongPlayerId: string | null = null

  for (const [pid, resp] of Object.entries(responses)) {
    if (resp === 'PONG') {
      pongPlayerId = pid
      break
    }
  }

  if (pongPlayerId) {
    const pongPlayer = getPlayerById(state, pongPlayerId)
    if (pongPlayer && state.lastDiscardedTile) {
      const matchingTiles = pongPlayer.handTiles.filter(
        (t) => t.suit === state.lastDiscardedTile!.suit && t.value === state.lastDiscardedTile!.value,
      )
      const tilesForMeld = matchingTiles.slice(0, 2)
      pongPlayer.handTiles = pongPlayer.handTiles.filter((t) => !tilesForMeld.includes(t))

      pongPlayer.meldGroups.push({
        type: 'pong',
        tiles: [...tilesForMeld, state.lastDiscardedTile],
      })

      state.currentTurnSeatId = pongPlayer.seatId
      state.nextPlayerStage = 'inHand'
      state.lastDiscardedTile = null
      state.lastDiscardedBy = null
    }
  } else {
    // No one ponged - tile goes to discard pile, advance turn
    state.nextPlayerStage = 'beforeDraw'
    advanceTurn(state)
  }

  state.responseWindow = null
  return pongPlayerId
}

export function checkLeak(state: GameState, playerId: string, _tileId: string): { leaked: boolean; viewerId?: string; direction?: 'left' | 'right' } {
  const player = getPlayerById(state, playerId)
  if (!player) return { leaked: false }

  const favored = isFavored(player.behaviorScore)
  const rate = getLeakRate(player.behaviorScore, favored)

  if (Math.random() < rate) {
    const direction = getLeakDirection()
    const viewerSeat = direction === 'left'
      ? ((player.seatId + 2) % 3) as SeatId
      : ((player.seatId + 1) % 3) as SeatId
    const viewer = getPlayerBySeat(state, viewerSeat)

    return {
      leaked: true,
      viewerId: viewer?.playerId,
      direction,
    }
  }

  return { leaked: false }
}
