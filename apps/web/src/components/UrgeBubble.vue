<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameStore } from '../stores/game'
import type { GameEvent } from '@kawuxing/protocol'

const game = useGameStore()

interface UrgeBubble {
  id: string
  seatId: number
  visible: boolean
}

const bubbles = ref<UrgeBubble[]>([])

function handleEvent(event: GameEvent) {
  if (event.type !== 'PLAYER_URGED') return

  const target = game.gameState?.players.find(p => p.playerId === event.targetPlayerId)
  if (!target) return

  const bubble: UrgeBubble = {
    id: `urge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    seatId: target.seatId,
    visible: true,
  }

  bubbles.value.push(bubble)

  // Fade out after 1.2s, remove after 1.7s
  setTimeout(() => {
    const b = bubbles.value.find(b => b.id === bubble.id)
    if (b) b.visible = false
  }, 1200)

  setTimeout(() => {
    bubbles.value = bubbles.value.filter(b => b.id !== bubble.id)
  }, 1700)
}

// Watch for events
watch(() => game.events.length, () => {
  const lastEvent = game.events[game.events.length - 1]
  if (lastEvent) handleEvent(lastEvent)
})

function getBubbleStyle(bubble: UrgeBubble) {
  // Position based on seat
  let left: string, bottom: string
  switch (bubble.seatId) {
    case 0: // player (bottom)
      left = '50%'
      bottom = '180px'
      break
    case 1: // bot left
      left = '20%'
      bottom = '75%'
      break
    case 2: // bot right
      left = '80%'
      bottom = '75%'
      break
    default:
      left = '50%'
      bottom = '50%'
  }

  return {
    left,
    bottom,
    transform: 'translateX(-50%)',
  }
}
</script>

<template>
  <div class="urge-layer">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="urge-bubble"
      :class="{ 'fade-out': !bubble.visible }"
      :style="getBubbleStyle(bubble)"
    >
      <span class="urge-text">快点快点</span>
      <span class="urge-icon">💨</span>
    </div>
  </div>
</template>

<style scoped>
.urge-layer {
  position: fixed;
  inset: 0;
  z-index: 160;
  pointer-events: none;
}

.urge-bubble {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 87, 34, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  animation: urge-float 1.5s ease forwards;
  transition: opacity 0.5s ease;
}

.urge-bubble.fade-out {
  opacity: 0;
}

.urge-text {
  letter-spacing: 1px;
}

.urge-icon {
  font-size: 14px;
  animation: urge-shake 0.3s ease infinite;
}

@keyframes urge-float {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(0) scale(0.7);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(-10px) scale(1);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(-40px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-60px) scale(0.9);
  }
}

@keyframes urge-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
</style>
