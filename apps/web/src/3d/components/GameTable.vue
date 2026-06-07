<script setup lang="ts">
import { TABLE_SIZE, TABLE_COLOR } from '../utils/constants'
</script>

<template>
  <!-- Table surface -->
  <TresMesh
    :position="[0, 0, 0]"
    :rotation="[-Math.PI / 2, 0, 0]"
    receive-shadow
  >
    <TresPlaneGeometry :args="[TABLE_SIZE, TABLE_SIZE]" />
    <TresMeshStandardMaterial :color="TABLE_COLOR" />
  </TresMesh>

  <!-- Table border -->
  <TresMesh
    :position="[0, -0.05, 0]"
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresPlaneGeometry :args="[TABLE_SIZE + 0.4, TABLE_SIZE + 0.4]" />
    <TresMeshStandardMaterial color="#0d3318" />
  </TresMesh>

  <!-- Center decoration -->
  <TresMesh :position="[0, 0.01, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresCircleGeometry :args="[0.8, 32]" />
    <TresMeshStandardMaterial color="#145025" />
  </TresMesh>
</template>
