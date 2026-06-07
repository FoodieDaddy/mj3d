<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import type { GameEvent } from '@kawuxing/protocol'

const game = useGameStore()

interface LeakInfo {
  id: string
  tileValue: number
  tileSuit: string
  direction: 'left' | 'right'
  visible: boolean
}

const leak = ref<LeakInfo | null>(null)
let fadeTimer: ReturnType<typeof setTimeout> | null = null

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

function handleEvent(event: GameEvent) {
  if (event.type !== 'TILE_LEAKED') return
  if (event.viewerId !== game.playerId) return

  // Find the tile info from game state
  const tile = game.gameState?.players
    .flatMap(p => [...p.handTiles, ...p.discardedTiles])
    .find(t => t.id === event.tileId)

  if (!tile) return

  // Determine direction based on viewer seat relative to leaker
  const leaker = game.gameState?.players.find(p => p.playerId === event.playerId)
  if (!leaker) return

  // Direction: if viewer is to the left of leaker, leaked "right" (tile went right)
  // Actually, the event already tells us who viewed it. We need to figure out direction.
  // viewerId is the player who SAW the leak. Direction is relative to the leaker.
  // If viewer seat = (leaker seat + 1) % 3 → leak went "right"
  // If viewer seat = (leaker seat + 2) % 3 → leak went "left"
  const viewer = game.gameState?.players.find(p => p.playerId === event.viewerId)
  if (!viewer) return

  const direction: 'left' | 'right' = viewer.seatId === ((leaker.seatId + 1) % 3) ? 'right' : 'left'

  if (fadeTimer) clearTimeout(fadeTimer)

  leak.value = {
    id: `leak-${event.tileId}-${Date.now()}`,
    tileValue: tile.value,
    tileSuit: tile.suit,
    direction,
    visible: true,
  }

  fadeTimer = setTimeout(() => {
    if (leak.value) {
      leak.value.visible = false
    }
    setTimeout(() => {
      leak.value = null
    }, 500) // Wait for fade out animation
  }, 2500)
}

// Watch for events
watch(() => game.events.length, () => {
  const lastEvent = game.events[game.events.length - 1]
  if (lastEvent) handleEvent(lastEvent)
})

onUnmounted(() => {
  if (fadeTimer) clearTimeout(fadeTimer)
})
</script>

<template>
  <div v-if="leak" class="leak-indicator" :class="{ 'fade-out': !leak.visible }">
    <div class="leak-icon">👁️</div>
    <div class="leak-tile" :style="{ color: suitColor(leak.tileSuit) }">
      <span class="leak-value">{{ leak.tileValue }}</span>
      <span class="leak-suit">{{ suitLabel(leak.tileSuit) }}</span>
    </div>
    <div class="leak-arrow" :class="`arrow-${leak.direction}`">
      {{ leak.direction === 'left' ? '←' : '→' }}
    </div>
  </div>
</template>

<style scoped>
.leak-indicator {
  position: fixed;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.85);
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 152, 0, 0.5);
  animation: leak-bounce 0.4s ease;
  transition: opacity 0.5s ease;
}

.leak-indicator.fade-out {
  opacity: 0;
}

.leak-icon {
  font-size: 18px;
}

.leak-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.leak-value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.leak-suit {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  margin-top: 1px;
}

.leak-arrow {
  font-size: 18px;
  font-weight: 700;
  color: #ff9800;
  animation: arrow-pulse 0.8s ease infinite;
}

.arrow-left {
  order: -1;
}

@keyframes leak-bounce {
  0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
  60% { transform: translateX(-50%) scale(1.1); }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

@keyframes arrow-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media screen and (orientation: landscape) and (max-width: 950px) {
  .leak-indicator {
    bottom: 110px;
  }
}
</style>
