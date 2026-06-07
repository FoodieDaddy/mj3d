<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/game'
import { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH } from '../utils/constants'

const game = useGameStore()

const isVisible = computed(() => {
  return game.gameState?.lastDiscardedTile !== null || game.isInResponseWindow
})

const tile = computed(() => {
  if (game.isInResponseWindow && game.responseWindowInfo) {
    return {
      id: game.responseWindowInfo.discardTileId,
      suit: game.responseWindowInfo.discardTileSuit,
      value: Number(game.responseWindowInfo.discardTileValue),
    }
  }
  return game.gameState?.lastDiscardedTile ?? null
})

const suitColor = computed(() => {
  if (!tile.value) return '#ffffff'
  switch (tile.value.suit) {
    case 'wan': return '#e53935'
    case 'tiao': return '#43a047'
    case 'tong': return '#1e88e5'
    default: return '#ffffff'
  }
})

const isResponseWindow = computed(() => game.isInResponseWindow)
</script>

<template>
  <TresGroup v-if="isVisible && tile" :position="[0, 0.3, 0.5]">
    <!-- Tile body -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[TILE_WIDTH, TILE_HEIGHT * 0.15, TILE_DEPTH]" />
      <TresMeshStandardMaterial
        :color="isResponseWindow ? '#fff8e1' : '#f5f0e8'"
        :emissive="isResponseWindow ? '#ff9800' : '#000000'"
        :emissiveIntensity="isResponseWindow ? 0.3 : 0"
      />
    </TresMesh>

    <!-- Tile face (colored indicator) -->
    <TresMesh :position="[0, TILE_HEIGHT * 0.08, 0]">
      <TresPlaneGeometry :args="[TILE_WIDTH * 0.6, TILE_DEPTH * 0.6]" />
      <TresMeshBasicMaterial :color="suitColor" />
    </TresMesh>

    <!-- Glow effect during response window -->
    <TresPointLight
      v-if="isResponseWindow"
      :position="[0, 0.5, 0]"
      :color="'#ff9800'"
      :intensity="2"
      :distance="3"
    />
  </TresGroup>
</template>
