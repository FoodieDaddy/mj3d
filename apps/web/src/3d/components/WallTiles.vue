<script setup lang="ts">
import { computed } from 'vue'
import TileMesh from './TileMesh.vue'
import { WALL_Y, WALL_Z } from '../utils/constants'

const props = defineProps<{
  count: number
}>()

const wallPositions = computed(() => {
  // Show a compact representation of the wall
  const positions: [number, number, number][] = []
  const maxShow = Math.min(props.count, 30)
  const startX = -((maxShow - 1) * 0.3) / 2

  for (let i = 0; i < maxShow; i++) {
    positions.push([startX + i * 0.3, WALL_Y, WALL_Z])
  }
  return positions
})
</script>

<template>
  <TileMesh
    v-for="(pos, index) in wallPositions"
    :key="index"
    :tile-id="`wall_${index}`"
    :face-up="false"
    :position="pos"
  />
</template>
