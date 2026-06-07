<script setup lang="ts">
import { computed } from 'vue'
import type { Tile } from '@kawuxing/protocol'
import TileMesh from './TileMesh.vue'
import { HAND_Y, HAND_Z, HAND_TILE_GAP, SELECTED_TILE_LIFT } from '../utils/constants'

const props = defineProps<{
  tiles: Tile[]
  selectedTileId?: string | null
  isMyTurn?: boolean
}>()

const emit = defineEmits<{
  select: [tileId: string]
  discard: [tileId: string]
}>()

const tilePositions = computed(() => {
  const totalWidth = (props.tiles.length - 1) * HAND_TILE_GAP
  const startX = -totalWidth / 2

  return props.tiles.map((tile, index) => ({
    tile,
    position: [
      startX + index * HAND_TILE_GAP,
      tile.id === props.selectedTileId ? HAND_Y + SELECTED_TILE_LIFT : HAND_Y,
      HAND_Z,
    ] as [number, number, number],
  }))
})

function handleTileClick(tileId: string) {
  emit('select', tileId)
}
</script>

<template>
  <TileMesh
    v-for="{ tile, position } in tilePositions"
    :key="tile.id"
    :tile-id="tile.id"
    :suit="tile.suit"
    :value="tile.value"
    :face-up="true"
    :selected="tile.id === selectedTileId"
    :highlighted="isMyTurn"
    :position="position"
    @click="handleTileClick(tile.id)"
  />
</template>
