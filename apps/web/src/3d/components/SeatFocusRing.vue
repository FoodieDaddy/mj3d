<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/game'
import type { SeatId } from '@kawuxing/protocol'

const game = useGameStore()

// Seat positions in 3D world
const seatPositions: Record<SeatId, [number, number, number]> = {
  0: [0, 0.02, 3.5],   // Player (bottom)
  1: [-3, 0.02, -1],   // Bot 1 (top-left)
  2: [3, 0.02, -1],    // Bot 2 (top-right)
}

const activeSeatId = computed(() => game.gameState?.currentTurnSeatId ?? null)

const isInResponseWindow = computed(() => game.isInResponseWindow)

// Pulse animation
const pulsePhase = ref(0)
let animFrame: number | null = null

function animate() {
  pulsePhase.value = (Date.now() % 1500) / 1500
  animFrame = requestAnimationFrame(animate)
}
animate()

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})

const pulseScale = computed(() => 1 + Math.sin(pulsePhase.value * Math.PI * 2) * 0.15)
const pulseOpacity = computed(() => 0.4 + Math.sin(pulsePhase.value * Math.PI * 2) * 0.2)
</script>

<template>
  <TresGroup v-if="activeSeatId !== null">
    <!-- Active seat ring -->
    <TresMesh
      :position="seatPositions[activeSeatId]"
      :rotation="[-Math.PI / 2, 0, 0]"
      :scale="[pulseScale, pulseScale, 1]"
    >
      <TresRingGeometry :args="[0.8, 1.0, 32]" />
      <TresMeshBasicMaterial
        :color="isInResponseWindow ? '#ff9800' : '#4caf50'"
        :opacity="pulseOpacity"
        transparent
      />
    </TresMesh>

    <!-- Response window glow for eligible players -->
    <template v-if="isInResponseWindow && game.responseWindowInfo">
      <TresMesh
        v-for="pid in game.responseWindowInfo.eligiblePlayerIds"
        :key="pid"
        :position="seatPositions[game.gameState?.players.find(p => p.playerId === pid)?.seatId ?? 0]"
        :rotation="[-Math.PI / 2, 0, 0]"
        :scale="[pulseScale * 1.2, pulseScale * 1.2, 1]"
      >
        <TresRingGeometry :args="[1.0, 1.2, 32]" />
        <TresMeshBasicMaterial
          color="#ff9800"
          :opacity="pulseOpacity * 0.6"
          transparent
        />
      </TresMesh>
    </template>
  </TresGroup>
</template>
