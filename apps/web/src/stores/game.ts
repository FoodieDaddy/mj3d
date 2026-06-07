import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalTransport, SocketTransport } from '@kawuxing/web-core'
import type { GameState, GameEvent, ClientAction, SeatId, Tile, GameTransport } from '@kawuxing/protocol'

type LegalAction = 'DRAW_TILE' | 'DRAW_TILE_ADVANCED' | 'DISCARD_TILE' | 'CLAIM_PONG' | 'CLAIM_KONG' | 'CLAIM_WIN' | 'PASS' | 'SHOW_HAND' | 'PEEK_ADVANCED_TILE' | 'PUT_TILE_IN_HAND'

interface ResponseWindowInfo {
  discardTileId: string
  discardTileValue: string
  discardTileSuit: string
  discardPlayerId: string
  eligiblePlayerIds: string[]
  deadlineAt: number
  myResponse: 'PONG' | 'PASS' | null
  canIPong: boolean
  secondsLeft: number
}

function createTransport(): GameTransport {
  const mode = import.meta.env.VITE_TRANSPORT_MODE || 'local'
  const params = new URLSearchParams(window.location.search)
  const acceptanceMode = params.get('mode') === 'acceptance'

  if (mode === 'socket') {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
    return new SocketTransport(wsUrl)
  }

  return new LocalTransport({ acceptanceMode })
}

export const useGameStore = defineStore('game', () => {
  const transport = createTransport()

  const gameState = ref<GameState | null>(null)
  const events = ref<GameEvent[]>([])
  const playerId = ref<string | null>(null)
  const connected = ref(false)
  const selectedTileId = ref<string | null>(null)

  // Action dialogs
  const showPongDialog = ref(false)
  const pongTile = ref<Tile | null>(null)
  const lastLeakEvent = ref<GameEvent | null>(null)
  const lastUrgeEvent = ref<GameEvent | null>(null)
  const showUndoDialog = ref(false)
  const undoTileId = ref<string | null>(null)
  const showShowHandDialog = ref(false)

  const myPlayer = computed(() => {
    if (!gameState.value || !playerId.value) return null
    return gameState.value.players.find((p) => p.playerId === playerId.value) ?? null
  })

  const myHandTiles = computed(() => myPlayer.value?.handTiles ?? [])
  const displayHandTiles = computed(() => {
    const tiles = [...myHandTiles.value]
    if (myPlayer.value?.advancedTile) {
      tiles.push(myPlayer.value.advancedTile)
    }
    return tiles
  })
  const mySeatId = computed(() => myPlayer.value?.seatId as SeatId ?? 0)
  const isMyTurn = computed(() => {
    if (!gameState.value || !myPlayer.value) return false
    return gameState.value.currentTurnSeatId === myPlayer.value.seatId
  })
  const canDiscard = computed(() => isMyTurn.value && gameState.value?.nextPlayerStage === 'inHand')
  const canDraw = computed(() => isMyTurn.value && gameState.value?.nextPlayerStage === 'beforeDraw')
  const advancedTile = computed(() => myPlayer.value?.advancedTile ?? null)
  const hasAdvancedTile = computed(() => advancedTile.value !== null)
  const hasPeekedAdvanced = computed(() => myPlayer.value?.hasPeekedAdvanced ?? false)
  const isGameOver = computed(() => gameState.value?.isGameOver ?? false)
  const winnerId = computed(() => gameState.value?.winnerId ?? null)
  const isMyWin = computed(() => winnerId.value === playerId.value)
  const wallCount = computed(() => gameState.value?.wallTiles.length ?? 0)
  const behaviorScore = computed(() => myPlayer.value?.behaviorScore ?? 50)

  const otherPlayers = computed(() => {
    if (!gameState.value || !playerId.value) return []
    return gameState.value.players.filter((p) => p.playerId !== playerId.value)
  })

  const canPongDiscard = computed(() => {
    if (!gameState.value || !myPlayer.value || !gameState.value.lastDiscardedTile) return false
    if (gameState.value.lastDiscardedBy === myPlayer.value.seatId) return false
    const matchingCount = myPlayer.value.handTiles.filter(
      (t) => t.suit === gameState.value!.lastDiscardedTile!.suit && t.value === gameState.value!.lastDiscardedTile!.value,
    ).length
    return matchingCount >= 2
  })

  const isInResponseWindow = computed(() => {
    return gameState.value?.nextPlayerStage === 'responseWindow' && gameState.value?.responseWindow !== null
  })

  const responseWindowInfo = computed<ResponseWindowInfo | null>(() => {
    const rw = gameState.value?.responseWindow
    if (!rw || !playerId.value) return null

    const myResponse = rw.responses[playerId.value] ?? null
    const canIPong = rw.eligiblePlayerIds.includes(playerId.value) && myResponse === null
    const secondsLeft = Math.max(0, Math.ceil((rw.deadlineAt - Date.now()) / 1000))

    return {
      discardTileId: rw.discardTileId,
      discardTileValue: rw.discardTileValue,
      discardTileSuit: rw.discardTileSuit,
      discardPlayerId: rw.discardPlayerId,
      eligiblePlayerIds: rw.eligiblePlayerIds,
      deadlineAt: rw.deadlineAt,
      myResponse,
      canIPong,
      secondsLeft,
    }
  })

  // Legal actions computed from game state
  const legalActions = computed<LegalAction[]>(() => {
    if (!gameState.value || !myPlayer.value || !connected.value || isGameOver.value) return []

    const actions: LegalAction[] = []
    const stage = gameState.value.nextPlayerStage
    const myTurn = isMyTurn.value

    if (myTurn && stage === 'beforeDraw') {
      actions.push('DRAW_TILE', 'DRAW_TILE_ADVANCED', 'SHOW_HAND')
    } else if (myTurn && stage === 'inHand' && hasAdvancedTile.value && !hasPeekedAdvanced.value) {
      // Must resolve advanced tile before discarding - can peek or put in hand
      actions.push('PEEK_ADVANCED_TILE', 'PUT_TILE_IN_HAND')
    } else if (myTurn && stage === 'inHand' && hasAdvancedTile.value && hasPeekedAdvanced.value) {
      // Already peeked - can only put in hand
      actions.push('PUT_TILE_IN_HAND')
    } else if (myTurn && stage === 'inHand') {
      actions.push('DISCARD_TILE', 'SHOW_HAND')
    }

    // Response to other player's discard (legacy discarded stage)
    if (!myTurn && stage === 'discarded' && gameState.value.lastDiscardedTile) {
      if (canPongDiscard.value) actions.push('CLAIM_PONG')
      actions.push('PASS')
    }

    // Response window
    if (stage === 'responseWindow' && gameState.value.responseWindow) {
      const rw = gameState.value.responseWindow
      const myId = playerId.value
      if (myId && rw.eligiblePlayerIds.includes(myId) && rw.responses[myId] === null) {
        if (canPongDiscard.value) actions.push('CLAIM_PONG')
        actions.push('PASS')
      }
    }

    return actions
  })

  const isWaitingForBot = computed(() => {
    if (!gameState.value || !connected.value || isGameOver.value) return false
    if (isMyTurn.value) return false
    // During response window, not "waiting for bot" if human needs to respond
    if (isInResponseWindow.value && responseWindowInfo.value?.canIPong) return false
    if (isInResponseWindow.value && responseWindowInfo.value?.myResponse === null) return false
    const currentPlayer = gameState.value.players.find(p => p.seatId === gameState.value!.currentTurnSeatId)
    return currentPlayer?.playerType === 'bot' && gameState.value.nextPlayerStage !== 'discarded' && gameState.value.nextPlayerStage !== 'responseWindow'
  })

  // Can undo: player just discarded, and next player hasn't discarded yet
  const canUndo = computed(() => {
    if (!gameState.value || !myPlayer.value || !connected.value || isGameOver.value) return false
    if (gameState.value.lastDiscardedBy !== myPlayer.value.seatId) return false
    // Can't undo during response window (other players might be responding)
    if (isInResponseWindow.value) return false
    // Can undo if next player is still beforeDraw/drawing/inHand (not discarded yet)
    const stage = gameState.value.nextPlayerStage
    return stage === 'beforeDraw' || stage === 'drawing' || stage === 'inHand'
  })

  // Listen for state and events
  transport.onState((state) => {
    gameState.value = state

    // Auto-detect human player after join
    if (!playerId.value || !connected.value) {
      const human = state.players.find((p) => p.playerType === 'human')
      if (human) {
        playerId.value = human.playerId
        connected.value = true
      }
    }

    // Clear selection when turn changes or stage changes
    if (selectedTileId.value) {
      const myPlayer = state.players.find(p => p.playerId === playerId.value)
      if (!myPlayer || state.currentTurnSeatId !== myPlayer.seatId || state.nextPlayerStage !== 'inHand') {
        selectedTileId.value = null
      }
    }
  })

  transport.onEvent((event) => {
    events.value.push(event)
    if (events.value.length > 100) {
      events.value = events.value.slice(-50)
    }

    // Handle specific events
    if (event.type === 'TILE_LEAKED' && event.viewerId === playerId.value) {
      lastLeakEvent.value = event
      setTimeout(() => { lastLeakEvent.value = null }, 3000)
    }

    if (event.type === 'PLAYER_URGED' && event.targetPlayerId === playerId.value) {
      lastUrgeEvent.value = event
      setTimeout(() => { lastUrgeEvent.value = null }, 3000)
    }

    // Auto-show pong dialog when response window opens and we can pong
    if (event.type === 'RESPONSE_WINDOW_OPENED') {
      setTimeout(() => {
        if (canPongDiscard.value && isInResponseWindow.value) {
          pongTile.value = gameState.value?.lastDiscardedTile ?? null
          showPongDialog.value = true
        }
      }, 100)
    }
  })

  function sendAction(action: ClientAction) {
    transport.send(action)
  }

  function joinGame(playerName?: string) {
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: '',
      type: 'ROOM_JOIN',
      payload: { playerName },
    } as ClientAction)
  }

  function drawTile(advance: boolean = false) {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'DRAW_TILE',
      payload: { advance },
    } as ClientAction)
  }

  function discardTile(tileId: string) {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'DISCARD_TILE',
      payload: { tileId },
    } as ClientAction)
  }

  function peekAdvancedTile() {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'PEEK_ADVANCED_TILE',
      payload: {},
    } as ClientAction)
  }

  function putTileInHand(tileId: string) {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'PUT_TILE_IN_HAND',
      payload: { tileId },
    } as ClientAction)
  }

  function pass() {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'PASS',
      payload: {},
    } as ClientAction)
    showPongDialog.value = false
  }

  function claimPong(tileId: string) {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'CLAIM_PONG',
      payload: { tileId },
    } as ClientAction)
    showPongDialog.value = false
  }

  function requestUndo(tileId: string) {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'REQUEST_UNDO_DISCARD',
      payload: { tileId },
    } as ClientAction)
    showUndoDialog.value = false
  }

  function urgePlayer(targetPlayerId: string) {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'URGE_PLAYER',
      payload: { targetPlayerId },
    } as ClientAction)
  }

  function showHand() {
    if (!playerId.value) return
    // Show confirmation dialog first
    showShowHandDialog.value = true
  }

  function confirmShowHand() {
    if (!playerId.value) return
    showShowHandDialog.value = false
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'SHOW_HAND',
      payload: {},
    } as ClientAction)
  }

  function cancelShowHand() {
    showShowHandDialog.value = false
  }

  function claimWin() {
    if (!playerId.value) return
    sendAction({
      protocolVersion: 1,
      actionId: crypto.randomUUID(),
      roomId: 'main',
      playerId: playerId.value,
      type: 'CLAIM_WIN',
      payload: {},
    } as ClientAction)
  }

  function selectTile(tileId: string) {
    if (selectedTileId.value === tileId) {
      // Second click = discard
      if (canDiscard.value) {
        discardTile(tileId)
        selectedTileId.value = null
      }
    } else {
      // Verify tile exists in displayHandTiles
      const exists = displayHandTiles.value.some(t => t.id === tileId)
      if (exists) {
        selectedTileId.value = tileId
      }
    }
  }

  function discardSelectedTile() {
    if (!selectedTileId.value || !canDiscard.value) return
    discardTile(selectedTileId.value)
    selectedTileId.value = null
  }

  // Show pong dialog when someone discards and we can pong
  function checkPongOpportunity() {
    if (canPongDiscard.value) {
      pongTile.value = gameState.value!.lastDiscardedTile
      showPongDialog.value = true
    }
  }

  // Show undo dialog
  function openUndoDialog(tileId: string) {
    undoTileId.value = tileId
    showUndoDialog.value = true
  }

  return {
    gameState,
    events,
    playerId,
    connected,
    selectedTileId,
    myPlayer,
    myHandTiles,
    displayHandTiles,
    mySeatId,
    isMyTurn,
    canDiscard,
    canDraw,
    advancedTile,
    hasAdvancedTile,
    hasPeekedAdvanced,
    isGameOver,
    winnerId,
    isMyWin,
    wallCount,
    behaviorScore,
    otherPlayers,
    canPongDiscard,
    isInResponseWindow,
    responseWindowInfo,
    legalActions,
    isWaitingForBot,
    canUndo,
    showPongDialog,
    pongTile,
    lastLeakEvent,
    lastUrgeEvent,
    showUndoDialog,
    undoTileId,
    showShowHandDialog,
    joinGame,
    drawTile,
    discardTile,
    peekAdvancedTile,
    putTileInHand,
    pass,
    claimPong,
    requestUndo,
    urgePlayer,
    showHand,
    confirmShowHand,
    cancelShowHand,
    claimWin,
    selectTile,
    discardSelectedTile,
    checkPongOpportunity,
    openUndoDialog,
  }
})
