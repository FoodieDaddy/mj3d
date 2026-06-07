<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import type { GameEvent } from '@kawuxing/protocol'

const game = useGameStore()

interface FlyTile {
  id: string
  tile: { value: number; suit: string }
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
}

const flyTiles = ref<FlyTile[]>([])
let animFrame: number | null = null

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

// Listen for discard events to trigger fly animation
function handleEvent(event: GameEvent) {
  if (event.type !== 'TILE_DISCARDED') return

  const player = game.gameState?.players.find(p => p.playerId === event.playerId)
  if (!player) return

  // Find the tile
  const tile = player.discardedTiles.find(t => t.id === event.tileId)
  if (!tile) return

  // Determine start position based on seat
  let fromX: number, fromY: number
  if (player.playerId === game.playerId) {
    // Player (bottom center)
    fromX = 50
    fromY = 85
  } else if (player.seatId === 1) {
    // Bot 1 (top left)
    fromX = 15
    fromY = 15
  } else {
    // Bot 2 (top right)
    fromX = 85
    fromY = 15
  }

  const flyTile: FlyTile = {
    id: `fly-${event.tileId}-${Date.now()}`,
    tile: { value: tile.value, suit: tile.suit },
    fromX,
    fromY,
    toX: 50,
    toY: 45,
    progress: 0,
  }

  flyTiles.value.push(flyTile)
  startAnimation()
}

// Watch for events
watch(() => game.events.length, () => {
  const lastEvent = game.events[game.events.length - 1]
  if (lastEvent) handleEvent(lastEvent)
})

function startAnimation() {
  if (animFrame) return

  function animate() {
    let anyActive = false
    for (const ft of flyTiles.value) {
      if (ft.progress < 1) {
        ft.progress = Math.min(1, ft.progress + 0.04)
        anyActive = true
      }
    }

    // Remove completed animations
    flyTiles.value = flyTiles.value.filter(ft => ft.progress < 1)

    if (anyActive || flyTiles.value.length > 0) {
      animFrame = requestAnimationFrame(animate)
    } else {
      animFrame = null
    }
  }

  animFrame = requestAnimationFrame(animate)
}

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})

function getFlyStyle(ft: FlyTile) {
  const x = ft.fromX + (ft.toX - ft.fromX) * ft.progress
  const y = ft.fromY + (ft.toY - ft.fromY) * ft.progress
  const scale = 1 - ft.progress * 0.3
  const opacity = ft.progress > 0.8 ? (1 - ft.progress) * 5 : 1

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity,
  }
}
</script>

<template>
  <div class="fly-layer" v-if="flyTiles.length > 0">
    <div
      v-for="ft in flyTiles"
      :key="ft.id"
      class="fly-tile"
      :style="getFlyStyle(ft)"
    >
      <span class="ft-value" :style="{ color: suitColor(ft.tile.suit) }">{{ ft.tile.value }}</span>
      <span class="ft-suit" :style="{ color: suitColor(ft.tile.suit) }">{{ suitLabel(ft.tile.suit) }}</span>
    </div>
  </div>
</template>

<style scoped>
.fly-layer {
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: none;
}

.fly-tile {
  position: absolute;
  width: 48px;
  height: 64px;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: none;
}

.ft-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.ft-suit {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  margin-top: 2px;
}
</style>
