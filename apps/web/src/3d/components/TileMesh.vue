<script setup lang="ts">
import { computed, watch, shallowRef, onUnmounted } from 'vue'
import * as THREE from 'three'
import { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH } from '../utils/constants'

const props = withDefaults(defineProps<{
  tileId: string
  suit?: string
  value?: number
  faceUp?: boolean
  highlighted?: boolean
  selected?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
}>(), {
  faceUp: true,
  highlighted: false,
  selected: false,
  position: () => [0, 0, 0],
  rotation: () => [0, 0, 0],
})

const emit = defineEmits<{
  click: [tileId: string]
}>()

const suitColor = computed(() => {
  switch (props.suit) {
    case 'wan': return '#e53935'
    case 'tiao': return '#43a047'
    case 'tong': return '#1e88e5'
    default: return '#ffffff'
  }
})

const suitLabel = computed(() => {
  switch (props.suit) {
    case 'wan': return '万'
    case 'tiao': return '条'
    case 'tong': return '筒'
    default: return ''
  }
})

const emissiveColor = computed(() => {
  if (props.selected) return '#ffeb3b'
  if (props.highlighted) return '#ff9800'
  return '#000000'
})

const emissiveIntensity = computed(() => {
  if (props.selected) return 0.6
  if (props.highlighted) return 0.3
  return 0
})

// Generate canvas texture for tile face
const faceTexture = shallowRef<THREE.CanvasTexture | null>(null)

function createFaceTexture(): THREE.CanvasTexture | null {
  if (!props.faceUp || !props.value) return null

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 192
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, 128, 192)

  // Value number
  ctx.fillStyle = suitColor.value
  ctx.font = 'bold 72px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(props.value), 64, 70)

  // Suit label
  if (suitLabel.value) {
    ctx.font = 'bold 40px sans-serif'
    ctx.fillText(suitLabel.value, 64, 140)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

watch(
  () => [props.faceUp, props.value, props.suit],
  () => {
    if (faceTexture.value) {
      faceTexture.value.dispose()
    }
    faceTexture.value = createFaceTexture()
  },
  { immediate: true }
)

onUnmounted(() => {
  if (faceTexture.value) {
    faceTexture.value.dispose()
  }
})

function onClick(event: { stopPropagation: () => void }) {
  event.stopPropagation()
  emit('click', props.tileId)
}
</script>

<template>
  <TresGroup
    :position="position"
    :rotation="rotation"
  >
    <!-- Tile body -->
    <TresMesh
      :userData="{ type: 'tile', tileId, action: 'select_tile' }"
      @click="onClick"
    >
      <TresBoxGeometry :args="[TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH]" />
      <TresMeshStandardMaterial
        color="#f5f0e8"
        :emissive="emissiveColor"
        :emissive-intensity="emissiveIntensity"
      />
    </TresMesh>

    <!-- Tile face with canvas texture -->
    <TresMesh
      v-if="faceUp && faceTexture"
      :position="[0, 0, TILE_DEPTH / 2 + 0.01]"
    >
      <TresPlaneGeometry :args="[TILE_WIDTH * 0.8, TILE_HEIGHT * 0.8]" />
      <TresMeshBasicMaterial :map="faceTexture" />
    </TresMesh>

    <!-- Back face (when face down) -->
    <TresMesh
      v-if="!faceUp"
      :position="[0, 0, TILE_DEPTH / 2 + 0.01]"
    >
      <TresPlaneGeometry :args="[TILE_WIDTH * 0.85, TILE_HEIGHT * 0.85]" />
      <TresMeshStandardMaterial color="#2e7d32" />
    </TresMesh>
  </TresGroup>
</template>
