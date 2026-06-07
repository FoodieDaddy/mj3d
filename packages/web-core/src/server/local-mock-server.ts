import type {
  ClientAction,
  GameEvent,
  GameState,
  SeatId,
} from '@kawuxing/protocol'
import { LocalTransport } from '../transport/local-transport'
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
  canKong,
  applyUrge,
  applyUndoRequest,
  checkLeak,
  openResponseWindow,
  isResponseWindowResolved,
  resolveResponseWindow,
} from './game-state-manager'
import { applyBehaviorDelta } from '../score/behavior-score'
import { createBotId, createGuestId, createGameId } from './id-generator'

const ROOM_ID = 'main'
const BOT_NAMES = ['电脑A', '电脑B', '电脑C']
const BOT_STYLES = ['normal', 'fast', 'loose'] as const

export class LocalMockServer {
  private state: GameState
  private transport: LocalTransport
  private humanPlayerId: string | null = null
  private acceptanceMode: boolean

  constructor(transport: LocalTransport, options?: { acceptanceMode?: boolean }) {
    this.transport = transport
    this.acceptanceMode = options?.acceptanceMode ?? false
    this.state = createGameState(ROOM_ID, createGameId())
  }

  handleAction(action: ClientAction): void {
    switch (action.type) {
      case 'ROOM_JOIN':
        this.handleJoinRoom(action.playerId, action.payload.playerName)
        break
      case 'DRAW_TILE':
        this.handleDrawTile(action.playerId, action.payload.advance)
        break
      case 'PEEK_ADVANCED_TILE':
        this.handlePeekAdvancedTile(action.playerId)
        break
      case 'PUT_TILE_IN_HAND':
        this.handlePutTileInHand(action.playerId, action.payload.tileId)
        break
      case 'DISCARD_TILE':
        this.handleDiscardTile(action.playerId, action.payload.tileId)
        break
      case 'CLAIM_PONG':
        this.handleClaimPong(action.playerId, action.payload.tileId)
        break
      case 'CLAIM_KONG':
        this.handleClaimKong(action.playerId, action.payload.tileId)
        break
      case 'CLAIM_WIN':
        this.handleClaimWin(action.playerId)
        break
      case 'PASS':
        this.handlePass(action.playerId)
        break
      case 'URGE_PLAYER':
        this.handleUrgePlayer(action.playerId, action.payload.targetPlayerId)
        break
      case 'REQUEST_UNDO_DISCARD':
        this.handleRequestUndo(action.playerId, action.payload.tileId)
        break
      case 'SHOW_HAND':
        this.handleShowHand(action.playerId)
        break
      default:
        console.warn('[LocalMockServer] unhandled action:', (action as { type: string }).type)
    }
  }

  getState(): GameState {
    return this.state
  }

  private handleJoinRoom(_playerId: string, playerName?: string): void {
    const guestId = createGuestId()
    this.humanPlayerId = guestId

    addPlayer(this.state, guestId, playerName || '玩家', 'human')
    this.emitEvent({ type: 'PLAYER_JOINED', roomId: ROOM_ID, gameId: this.state.gameId, playerId: guestId })

    for (let i = this.state.players.length; i < 3; i++) {
      const botId = createBotId(i)
      addPlayer(this.state, botId, BOT_NAMES[i], 'bot', BOT_STYLES[i])
      this.emitEvent({ type: 'BOT_FILLED', roomId: ROOM_ID, gameId: this.state.gameId, playerId: botId })
    }

    startGame(this.state, this.acceptanceMode ? 42 : undefined)
    this.emitState()

    if (this.state.currentTurnSeatId !== 0) {
      this.playBotsUntilHuman()
    }
  }

  private handleDrawTile(playerId: string, advance: boolean): void {
    const player = getPlayerById(this.state, playerId)
    if (!player || player.seatId !== this.state.currentTurnSeatId) return
    if (this.state.nextPlayerStage !== 'beforeDraw') return

    const tile = drawTile(this.state, player.seatId)
    if (!tile) return

    if (advance) {
      player.advancedTile = tile
      player.hasPeekedAdvanced = false
      this.emitEvent({
        type: 'TILE_DRAWN',
        roomId: ROOM_ID,
        gameId: this.state.gameId,
        playerId: player.playerId,
        tileId: tile.id,
        advanced: true,
      })
    } else {
      player.handTiles.push(tile)
      this.emitEvent({
        type: 'TILE_DRAWN',
        roomId: ROOM_ID,
        gameId: this.state.gameId,
        playerId: player.playerId,
        tileId: tile.id,
        advanced: false,
      })
    }

    this.state.nextPlayerStage = 'inHand'
    this.emitState()
  }

  private handlePeekAdvancedTile(playerId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player || !player.advancedTile) return

    player.hasPeekedAdvanced = true
    player.behaviorScore = applyBehaviorDelta(player.behaviorScore, -2)

    this.emitEvent({
      type: 'ADVANCED_TILE_PEEKED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId: player.playerId,
      tileId: player.advancedTile.id,
    })

    if (!this.acceptanceMode) {
      const leak = checkLeak(this.state, player.playerId, player.advancedTile.id)
      if (leak.leaked && leak.viewerId) {
        this.emitEvent({
          type: 'TILE_LEAKED',
          roomId: ROOM_ID,
          gameId: this.state.gameId,
          playerId: player.playerId,
          viewerId: leak.viewerId,
          tileId: player.advancedTile.id,
        })
      }
    }

    this.emitState()
  }

  private handlePutTileInHand(playerId: string, tileId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player) return

    const tile = player.advancedTile
    if (!tile || tile.id !== tileId) return

    putTileInHand(this.state, player.seatId, tile)

    this.emitEvent({
      type: 'TILE_PUT_IN_HAND',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId: player.playerId,
      tileId: tile.id,
    })

    this.emitState()
  }

  private handleDiscardTile(playerId: string, tileId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player || player.seatId !== this.state.currentTurnSeatId) return
    if (this.state.nextPlayerStage !== 'inHand') return
    if (player.advancedTile !== null) return // must PUT_TILE_IN_HAND first

    const tile = discardTile(this.state, player.seatId, tileId)
    if (!tile) return

    this.emitEvent({
      type: 'TILE_DISCARDED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId: player.playerId,
      tileId: tile.id,
    })

    // Open response window for other players to pong/kong/win
    openResponseWindow(this.state, this.acceptanceMode ? 5000 : 3000)

    this.emitEvent({
      type: 'RESPONSE_WINDOW_OPENED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      discardTileId: tile.id,
      discardPlayerId: player.playerId,
      eligiblePlayerIds: this.state.responseWindow?.eligiblePlayerIds ?? [],
    })

    this.emitState()

    // Auto-respond for bots
    this.autoRespondBots()
  }

  private handleClaimPong(playerId: string, tileId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player || !this.state.lastDiscardedTile) return
    if (!canPong(this.state, playerId, tileId)) return

    // Record response in response window
    if (this.state.responseWindow && this.state.responseWindow.eligiblePlayerIds.includes(playerId)) {
      this.state.responseWindow.responses[playerId] = 'PONG'
      this.tryResolveResponseWindow()
      return
    }

    // Fallback: direct pong (no response window)
    const matchingTiles = player.handTiles.filter(
      (t) => t.suit === this.state.lastDiscardedTile!.suit && t.value === this.state.lastDiscardedTile!.value,
    )
    const tilesForMeld = matchingTiles.slice(0, 2)
    player.handTiles = player.handTiles.filter((t) => !tilesForMeld.includes(t))

    player.meldGroups.push({
      type: 'pong',
      tiles: [...tilesForMeld, this.state.lastDiscardedTile],
    })

    this.state.currentTurnSeatId = player.seatId
    this.state.nextPlayerStage = 'inHand'
    this.state.lastDiscardedTile = null
    this.state.lastDiscardedBy = null

    this.emitState()
  }

  private handleClaimKong(playerId: string, tileId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player || !this.state.lastDiscardedTile) return
    if (!canKong(this.state, playerId, tileId)) return

    const matchingTiles = player.handTiles.filter(
      (t) => t.suit === this.state.lastDiscardedTile!.suit && t.value === this.state.lastDiscardedTile!.value,
    )
    const tilesForMeld = matchingTiles.slice(0, 3)
    player.handTiles = player.handTiles.filter((t) => !tilesForMeld.includes(t))

    player.meldGroups.push({
      type: 'kong',
      tiles: [...tilesForMeld, this.state.lastDiscardedTile],
    })

    this.state.currentTurnSeatId = player.seatId
    this.state.nextPlayerStage = 'beforeDraw'
    this.state.lastDiscardedTile = null

    this.emitState()
  }

  private handleClaimWin(playerId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player) return

    this.state.isGameOver = true
    this.state.winnerId = player.playerId

    this.emitEvent({
      type: 'WIN_DECLARED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId: player.playerId,
    })

    this.emitState()
  }

  private handlePass(playerId?: string): void {
    // Record pass in response window
    if (this.state.responseWindow && playerId && this.state.responseWindow.eligiblePlayerIds.includes(playerId)) {
      this.state.responseWindow.responses[playerId] = 'PASS'
      this.tryResolveResponseWindow()
      return
    }

    // Fallback: direct pass (no response window)
    if (this.state.nextPlayerStage === 'discarded') {
      advanceTurn(this.state)
      this.emitState()
      this.playBotsUntilHuman()
    }
  }

  private handleUrgePlayer(playerId: string, targetPlayerId: string): void {
    const delta = applyUrge(this.state, targetPlayerId)

    this.emitEvent({
      type: 'PLAYER_URGED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId,
      targetPlayerId,
    })

    if (delta !== 0) {
      this.emitEvent({
        type: 'BEHAVIOR_SCORE_CHANGED',
        roomId: ROOM_ID,
        gameId: this.state.gameId,
        playerId: targetPlayerId,
        delta,
        reason: 'URGE',
      })
    }

    this.emitState()
  }

  private handleRequestUndo(playerId: string, tileId: string): void {
    const delta = applyUndoRequest(this.state, playerId)
    if (delta === null) return

    this.emitEvent({
      type: 'UNDO_REQUESTED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId,
      tileId,
    })

    this.emitEvent({
      type: 'BEHAVIOR_SCORE_CHANGED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId,
      delta,
      reason: 'REQUEST_UNDO',
    })

    this.handleAllowUndo(playerId, tileId)
  }

  private handleAllowUndo(playerId: string, tileId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player) return

    const discIndex = player.discardedTiles.findIndex((t) => t.id === tileId)
    if (discIndex === -1) return

    const [tile] = player.discardedTiles.splice(discIndex, 1)
    player.handTiles.push(tile)

    this.emitEvent({
      type: 'UNDO_ACCEPTED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId,
      tileId,
    })

    this.emitState()
  }

  private handleShowHand(playerId: string): void {
    const player = getPlayerById(this.state, playerId)
    if (!player) return

    player.isShowHand = true

    this.emitEvent({
      type: 'HAND_SHOWN',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId,
    })

    this.emitState()
  }

  private autoRespondBots(): void {
    if (!this.state.responseWindow) return

    const { eligiblePlayerIds } = this.state.responseWindow
    const humanId = this.humanPlayerId

    // If no one is eligible, resolve immediately
    if (eligiblePlayerIds.length === 0) {
      this.tryResolveResponseWindow()
      return
    }

    for (const pid of eligiblePlayerIds) {
      if (pid === humanId) continue // Human responds manually

      const player = getPlayerById(this.state, pid)
      if (!player || player.playerType !== 'bot') continue

      // Bot decides: 40% chance to pong if eligible
      const shouldPong = this.acceptanceMode ? true : Math.random() < 0.4
      const delay = this.acceptanceMode ? 800 : 800 + Math.random() * 700

      setTimeout(() => {
        if (!this.state.responseWindow) return
        if (this.state.responseWindow.responses[pid] !== null) return

        this.state.responseWindow.responses[pid] = shouldPong ? 'PONG' : 'PASS'
        this.emitState()
        this.tryResolveResponseWindow()
      }, delay)
    }

    // Auto-timeout for human if they don't respond
    if (humanId && eligiblePlayerIds.includes(humanId)) {
      const timeoutMs = this.acceptanceMode ? 5000 : 3000
      setTimeout(() => {
        if (!this.state.responseWindow) return
        if (this.state.responseWindow.responses[humanId] !== null) return
        this.state.responseWindow.responses[humanId] = 'PASS'
        this.emitState()
        this.tryResolveResponseWindow()
      }, timeoutMs)
    }
  }

  private tryResolveResponseWindow(): void {
    if (!this.state.responseWindow) return
    if (!isResponseWindowResolved(this.state)) return

    const pongPlayerId = resolveResponseWindow(this.state)

    this.emitEvent({
      type: 'RESPONSE_WINDOW_CLOSED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      pongPlayerId,
    })

    this.emitState()

    if (pongPlayerId) {
      // Someone ponged - they need to discard
      const pongPlayer = getPlayerById(this.state, pongPlayerId)
      if (pongPlayer?.playerType === 'bot') {
        this.playBotDiscard(pongPlayer.seatId)
      }
      // If human ponged, they'll see the inHand stage and discard
    } else {
      // No one ponged - continue to next player
      this.playBotsUntilHuman()
    }
  }

  private playBotsUntilHuman(): void {
    const currentPlayer = getPlayerBySeat(this.state, this.state.currentTurnSeatId)
    if (!currentPlayer || currentPlayer.playerType !== 'bot') return

    // Small delay before starting bot turn
    setTimeout(() => {
      this.playBotTurn(currentPlayer.seatId)
    }, 600)
  }

  private playBotTurn(seatId: SeatId): void {
    const player = getPlayerBySeat(this.state, seatId)
    if (!player || player.playerType !== 'bot') return

    // Draw tile
    const tile = drawTile(this.state, seatId)
    if (!tile) return

    player.handTiles.push(tile)
    this.state.nextPlayerStage = 'inHand'
    this.emitEvent({
      type: 'TILE_DRAWN',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId: player.playerId,
      tileId: tile.id,
      advanced: false,
    })
    this.emitState()

    // Wait before discarding
    const discardDelay = this.acceptanceMode ? 800 : 800 + Math.random() * 400
    setTimeout(() => {
      this.playBotDiscard(seatId)
    }, discardDelay)
  }

  private playBotDiscard(seatId: SeatId): void {
    const player = getPlayerBySeat(this.state, seatId)
    if (!player || player.playerType !== 'bot') return
    if (player.handTiles.length === 0) return

    const randomIndex = this.acceptanceMode ? 0 : Math.floor(Math.random() * player.handTiles.length)
    const discardTileId = player.handTiles[randomIndex].id

    const discarded = discardTile(this.state, seatId, discardTileId)
    if (!discarded) return

    this.emitEvent({
      type: 'TILE_DISCARDED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      playerId: player.playerId,
      tileId: discarded.id,
    })

    // Open response window
    openResponseWindow(this.state, this.acceptanceMode ? 5000 : 3000)

    this.emitEvent({
      type: 'RESPONSE_WINDOW_OPENED',
      roomId: ROOM_ID,
      gameId: this.state.gameId,
      discardTileId: discarded.id,
      discardPlayerId: player.playerId,
      eligiblePlayerIds: this.state.responseWindow?.eligiblePlayerIds ?? [],
    })

    this.emitState()

    // Auto-respond for bots
    this.autoRespondBots()
  }

  private emitState(): void {
    this.transport.emitState(this.getVisibleState())
  }

  private emitEvent(event: GameEvent): void {
    this.transport.emitEvent(event)
  }

  private getVisibleState(): GameState {
    const humanPlayer = this.humanPlayerId
      ? getPlayerById(this.state, this.humanPlayerId)
      : null

    return {
      ...this.state,
      responseWindow: this.state.responseWindow,
      players: this.state.players.map((p) => {
        if (p.playerId === humanPlayer?.playerId) {
          return p
        }
        return {
          ...p,
          handTiles: [],
        }
      }),
    }
  }
}
