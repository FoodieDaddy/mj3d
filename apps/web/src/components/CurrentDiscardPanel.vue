<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useGameStore } from '../stores/game'

const game = useGameStore()
const visible = ref(false)
const shrinking = ref(false)

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

const discardPlayerName = computed(() => {
  // During response window, use responseWindow info
  if (game.isInResponseWindow && game.responseWindowInfo) {
    const pid = game.responseWindowInfo.discardPlayerId
    const player = game.gameState?.players.find(p => p.playerId === pid)
    if (!player) return ''
    return player.playerId === game.playerId ? '你' : player.playerName
  }
  const seatId = game.gameState?.lastDiscardedBy
  if (seatId == null) return ''
  const player = game.gameState?.players.find(p => p.seatId === seatId)
  if (!player) return ''
  return player.playerId === game.playerId ? '你' : player.playerName
})

const lastTile = computed(() => {
  // During response window, show the discard tile
  if (game.isInResponseWindow && game.responseWindowInfo) {
    const rw = game.responseWindowInfo
    return { id: rw.discardTileId, suit: rw.discardTileSuit as 'wan' | 'tiao' | 'tong', value: Number(rw.discardTileValue) }
  }
  return game.gameState?.lastDiscardedTile ?? null
})

const isInResponseWindow = computed(() => game.isInResponseWindow)

watch(lastTile, (newTile) => {
  if (newTile) {
    visible.value = true
    shrinking.value = false
    // Don't auto-hide during response window
    if (!game.isInResponseWindow) {
      setTimeout(() => { shrinking.value = true }, 1500)
      setTimeout(() => { visible.value = false }, 2000)
    }
  }
})

// When response window closes, start hide animation
watch(isInResponseWindow, (inRW, wasInRW) => {
  if (wasInRW && !inRW && visible.value) {
    setTimeout(() => { shrinking.value = true }, 500)
    setTimeout(() => { visible.value = false }, 1000)
  }
})
</script>

<template>
  <Transition name="discard">
    <div v-if="visible && lastTile" class="discard-panel" :class="{ shrinking }">
      <div class="discard-player">{{ discardPlayerName }} 打出</div>
      <div class="discard-tile">
        <span class="tile-value" :style="{ color: suitColor(lastTile.suit) }">{{ lastTile.value }}</span>
        <span class="tile-suit" :style="{ color: suitColor(lastTile.suit) }">{{ suitLabel(lastTile.suit) }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.discard-panel {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: none;
  text-align: center;
  transition: all 0.5s ease;
}

.discard-panel.shrinking {
  transform: translateX(-50%) scale(0.6);
  opacity: 0.6;
}

.discard-player {
  font-size: 13px;
  font-weight: 700;
  color: #9fb2a5;
  margin-bottom: 8px;
}

.discard-tile {
  width: 72px;
  height: 100px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(232, 230, 218, 0.98));
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.tile-value {
  font-size: 32px;
  font-weight: 1000;
  line-height: 1;
}

.tile-suit {
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  margin-top: 4px;
}

.discard-enter-active { transition: all 0.3s ease; }
.discard-leave-active { transition: all 0.5s ease; }
.discard-enter-from { opacity: 0; transform: translateX(-50%) scale(1.5); }
.discard-leave-to { opacity: 0; transform: translateX(-50%) scale(0.3); }

@media screen and (orientation: landscape) and (max-width: 950px) {
  .discard-panel {
    bottom: 118px;
  }
}
</style>
