<script setup lang="ts">
defineProps<{
  tileId: string | null
}>()

const emit = defineEmits<{
  undo: []
  cancel: []
}>()
</script>

<template>
  <div v-if="tileId" class="dialog-overlay">
    <div class="dialog">
      <div class="dialog-title">撤回出牌</div>
      <div class="dialog-content">
        <div class="dialog-text">是否撤回这张牌？</div>
        <div class="dialog-warning">行为分 -4</div>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary" @click="emit('undo')">撤回</button>
        <button class="btn btn-secondary" @click="emit('cancel')">取消</button>
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

.dialog-text {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 8px;
}

.dialog-warning {
  color: #ff9800;
  font-size: 13px;
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
  background: #ff9800;
  color: white;
}

.btn-secondary {
  background: #455a64;
  color: white;
}
</style>
