<script setup lang="ts">
defineProps<{
  isWin: boolean
  winnerId: string | null
}>()

const emit = defineEmits<{
  restart: []
}>()
</script>

<template>
  <div class="dialog-overlay">
    <div class="dialog">
      <div class="dialog-icon">{{ isWin ? '🎉' : '😮' }}</div>
      <div class="dialog-title">{{ isWin ? '恭喜胡牌！' : '游戏结束' }}</div>
      <div class="dialog-content">
        <div v-if="!isWin && winnerId" class="winner-info">
          {{ winnerId }} 胡牌
        </div>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary" @click="emit('restart')">再来一局</button>
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: #1a2332;
  border-radius: 16px;
  padding: 32px;
  min-width: 300px;
  text-align: center;
}

.dialog-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.dialog-content {
  margin-bottom: 24px;
}

.winner-info {
  color: #aaa;
  font-size: 14px;
}

.dialog-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #4caf50;
  color: white;
}
</style>
