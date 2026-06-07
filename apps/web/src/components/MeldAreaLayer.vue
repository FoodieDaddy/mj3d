<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { SeatId, MeldGroup } from '@kawuxing/protocol'

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

interface SeatMelds {
  seatId: SeatId
  playerName: string
  melds: MeldGroup[]
  position: 'bottom' | 'top-left' | 'top-right'
}

const seatMelds = computed<SeatMelds[]>(() => {
  if (!game.gameState) return []
  return game.gameState.players
    .filter(p => p.meldGroups.length > 0)
    .map((p) => {
      let position: SeatMelds['position'] = 'bottom'
      if (p.seatId === 1) position = 'top-left'
      if (p.seatId === 2) position = 'top-right'

      return {
        seatId: p.seatId,
        playerName: p.playerId === game.playerId ? '你' : p.playerName,
        melds: p.meldGroups,
        position,
      }
    })
})

function meldLabel(meld: MeldGroup): string {
  if (meld.tiles.length === 0) return ''
  const tile = meld.tiles[0]
  return `${tile.value}${suitLabel(tile.suit)}`
}
</script>

<template>
  <div class="meld-layer" v-if="game.connected && seatMelds.length > 0">
    <div
      v-for="seat in seatMelds"
      :key="seat.seatId"
      class="meld-area"
      :class="`pos-${seat.position}`"
    >
      <div class="meld-label">{{ seat.playerName }} 副露</div>
      <div class="meld-groups">
        <div v-for="(meld, i) in seat.melds" :key="i" class="meld-group">
          <span class="meld-type">{{ meld.type === 'pong' ? '碰' : '杠' }}</span>
          <span class="meld-value" :style="{ color: suitColor(meld.tiles[0]?.suit ?? '') }">{{ meldLabel(meld) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meld-layer {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
}

.meld-area {
  position: absolute;
  max-width: 160px;
}

.pos-bottom {
  bottom: 210px;
  left: 50%;
  transform: translateX(-50%);
}

.pos-top-left {
  top: 80px;
  left: 12px;
}

.pos-top-right {
  top: 80px;
  right: 12px;
}

.meld-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.meld-groups {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meld-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.meld-type {
  font-size: 11px;
  color: #ff9800;
  font-weight: 600;
}

.meld-value {
  font-size: 13px;
  font-weight: 700;
}
</style>
