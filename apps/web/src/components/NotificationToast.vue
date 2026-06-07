<script setup lang="ts">
defineProps<{
  message: string
  type?: 'info' | 'warning' | 'success' | 'error'
}>()
</script>

<template>
  <div class="toast" :class="type || 'info'">
    {{ message }}
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 200;
  animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
  pointer-events: none;
}

.info {
  background: rgba(33, 150, 243, 0.9);
  color: white;
}

.warning {
  background: rgba(255, 152, 0, 0.9);
  color: white;
}

.success {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.error {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

@keyframes slideIn {
  from { top: 20px; opacity: 0; }
  to { top: 60px; opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
