<script setup lang="ts">
import { computed } from 'vue'
import type { Tile } from '@kawuxing/protocol'
import TileMesh from './TileMesh.vue'
import { DISCARD_START_X, DISCARD_START_Z, DISCARD_GAP, DISCARD_ROW_HEIGHT, DISCARD_PER_ROW } from '../utils/constants'

const props = defineProps<{
  tiles: Tile[]
}>()

const tilePositions = computed(() => {
  return props.tiles.map((tile, index) => {
    const row = Math.floor(index / DISCARD_PER_ROW)
    const col = index % DISCARD_PER_ROW
    return {
      tile,
      position: [
        DISCARD_START_X + col * DISCARD_GAP,
        0.25,
        DISCARD_START_Z + row * DISCARD_ROW_HEIGHT,
      ] as [number, number, number],
    }
  })
})
</script>

<template>
  <TileMesh
    v-for="{ tile, position } in tilePositions"
    :key="tile.id"
    :tile-id="tile.id"
    :suit="tile.suit"
    :value="tile.value"
    :face-up="true"
    :position="position"
  />
</template>
