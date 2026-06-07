<script setup lang="ts">
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="dialog-overlay">
    <div class="dialog">
      <div class="dialog-icon">亮牌</div>
      <div class="dialog-title">确认亮牌？</div>
      <div class="dialog-content">
        <div class="dialog-text">亮牌后你的手牌对所有人可见</div>
        <div class="dialog-warning">输赢倍率 x2</div>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary" @click="emit('confirm')">确认亮牌</button>
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
  border-radius: 16px;
  padding: 28px;
  min-width: 280px;
  text-align: center;
}

.dialog-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
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
  font-size: 15px;
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  min-width: 100px;
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
