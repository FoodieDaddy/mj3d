<script setup lang="ts">
import { computed } from 'vue'
import type { Tile } from '@kawuxing/protocol'

const props = defineProps<{
  tile: Tile | null
}>()

const emit = defineEmits<{
  pong: []
  pass: []
}>()

const suitLabel = computed(() => {
  switch (props.tile?.suit) {
    case 'wan': return '万'
    case 'tiao': return '条'
    case 'tong': return '筒'
    default: return ''
  }
})
</script>

<template>
  <div v-if="tile" class="dialog-overlay">
    <div class="dialog">
      <div class="dialog-title">碰牌</div>
      <div class="dialog-content">
        <div class="tile-preview">
          <span class="tile-value">{{ tile.value }}</span>
          <span class="tile-suit">{{ suitLabel }}</span>
        </div>
        <div class="dialog-text">是否碰这张牌？</div>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary" @click="emit('pong')">碰</button>
        <button class="btn btn-secondary" @click="emit('pass')">过</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: #1a2332;
  border-radius: 12px;
  padding: 24px;
  min-width: 280px;
  text-align: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.dialog-content {
  margin-bottom: 20px;
}

.tile-preview {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: #f5f0e8;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.tile-value {
  font-size: 28px;
  font-weight: 700;
  color: #e53935;
}

.tile-suit {
  font-size: 14px;
  color: #666;
}

.dialog-text {
  color: #aaa;
  font-size: 14px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  min-width: 80px;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-secondary {
  background: #455a64;
  color: white;
}
</style>
