<script setup lang="ts">
import type { Tile } from '@kawuxing/protocol'
import TileMesh from './TileMesh.vue'
import { HAND_Y, HAND_Z } from '../utils/constants'

defineProps<{
  tile: Tile | null
  peeked?: boolean
}>()

const emit = defineEmits<{
  peek: []
  putInHand: [tileId: string]
}>()
</script>

<template>
  <TileMesh
    v-if="tile"
    :tile-id="tile.id"
    :suit="peeked ? tile.suit : undefined"
    :value="peeked ? tile.value : undefined"
    :face-up="peeked"
    :highlighted="true"
    :position="[3.5, HAND_Y + 0.3, HAND_Z]"
    @click="peeked ? emit('putInHand', tile.id) : emit('peek')"
  />
</template>
