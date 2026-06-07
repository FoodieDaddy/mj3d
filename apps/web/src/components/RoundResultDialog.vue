<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const game = useGameStore()

const emit = defineEmits<{
  restart: []
}>()

const winnerName = computed(() => {
  if (!game.winnerId || !game.gameState) return ''
  const winner = game.gameState.players.find(p => p.playerId === game.winnerId)
  if (!winner) return ''
  return winner.playerId === game.playerId ? '你' : winner.playerName
})

const isShowHand = computed(() => {
  if (!game.winnerId || !game.gameState) return false
  const winner = game.gameState.players.find(p => p.playerId === game.winnerId)
  return winner?.isShowHand ?? false
})

const multiplier = computed(() => isShowHand.value ? 2 : 1)
</script>

<template>
  <div class="dialog-overlay">
    <div class="dialog">
      <div class="dialog-icon">{{ game.isMyWin ? '胡牌' : '结束' }}</div>
      <div class="dialog-title">{{ game.isMyWin ? '恭喜胡牌！' : '本局结束' }}</div>
      <div class="dialog-content">
        <div class="result-row">
          <span class="result-label">胡牌者</span>
          <span class="result-value">{{ winnerName }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">亮牌</span>
          <span class="result-value">{{ isShowHand ? '是' : '否' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">倍率</span>
          <span class="result-value multiplier">x{{ multiplier }}</span>
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
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

.dialog {
  background: linear-gradient(135deg, #1a2332 0%, #0d1b2a 100%);
  border-radius: 20px;
  padding: 32px;
  min-width: 300px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialog-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
}

.dialog-content {
  margin-bottom: 24px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.result-label {
  color: #888;
  font-size: 14px;
}

.result-value {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.result-value.multiplier {
  color: #ff9800;
  font-size: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 14px 40px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
}

.btn:active {
  transform: scale(0.95);
}
</style>
