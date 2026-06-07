<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { Tile, SeatId } from '@kawuxing/protocol'

const game = useGameStore()

function suitLabel(suit: string): string {
  switch (suit) {
    case 'wan': return '万'
    case 'tiao': return '条'
    case 'tong': return '筒'
    default: return ''
  }
}

function suitColor(suit: string): string {
  switch (suit) {
    case 'wan': return '#e53935'
    case 'tiao': return '#43a047'
    case 'tong': return '#1e88e5'
    default: return '#fff'
  }
}

interface SeatDiscard {
  seatId: SeatId
  playerName: string
  tiles: Tile[]
  position: 'bottom' | 'top-left' | 'top-right'
}

const seatDiscards = computed<SeatDiscard[]>(() => {
  if (!game.gameState) return []
  return game.gameState.players.map((p) => {
    let position: SeatDiscard['position'] = 'bottom'
    if (p.seatId === 1) position = 'top-left'
    if (p.seatId === 2) position = 'top-right'

    return {
      seatId: p.seatId,
      playerName: p.playerId === game.playerId ? '你' : p.playerName,
      tiles: p.discardedTiles.slice(-6),
      position,
    }
  })
})
</script>

<template>
  <div class="discard-layer" v-if="game.connected">
    <div
      v-for="seat in seatDiscards"
      :key="seat.seatId"
      class="discard-area"
      :class="`pos-${seat.position}`"
    >
      <div class="discard-label">{{ seat.playerName }} 弃牌</div>
      <div class="discard-tiles">
        <div v-for="tile in seat.tiles" :key="tile.id" class="mini-tile">
          <span class="mt-val" :style="{ color: suitColor(tile.suit) }">{{ tile.value }}</span>
          <span class="mt-suit" :style="{ color: suitColor(tile.suit) }">{{ suitLabel(tile.suit) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discard-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.discard-area {
  position: absolute;
  max-width: 180px;
}

.pos-bottom {
  bottom: 210px;
  left: 12px;
}

.pos-top-left {
  top: 50px;
  left: 12px;
}

.pos-top-right {
  top: 50px;
  right: 12px;
}

.discard-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.discard-tiles {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.mini-tile {
  width: 32px;
  height: 42px;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.mt-val {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.mt-suit {
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  margin-top: 1px;
}
</style>
