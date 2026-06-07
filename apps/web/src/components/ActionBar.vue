<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const game = useGameStore()

interface ActionButton {
  key: string
  label: string
  hint?: string
  style: 'primary' | 'secondary' | 'accent' | 'danger'
  disabled: boolean
}

const buttons = computed<ActionButton[]>(() => {
  if (!game.connected) return []
  if (game.isGameOver) return [{ key: 'RESTART', label: '再来一局', style: 'primary', disabled: false }]

  const btns = game.legalActions.map((action) => {
    const map: Record<string, ActionButton> = {
      DRAW_TILE: { key: 'DRAW_TILE', label: '摸牌', style: 'primary', disabled: false },
      DRAW_TILE_ADVANCED: { key: 'DRAW_TILE_ADVANCED', label: '提前拿', style: 'secondary', disabled: false },
      DISCARD_TILE: { key: 'DISCARD_TILE', label: '出这张', style: 'primary', disabled: !game.selectedTileId, hint: !game.selectedTileId ? '请先选牌' : undefined },
      CLAIM_PONG: { key: 'CLAIM_PONG', label: '碰！', style: 'accent', disabled: false },
      CLAIM_KONG: { key: 'CLAIM_KONG', label: '杠', style: 'accent', disabled: false },
      CLAIM_WIN: { key: 'CLAIM_WIN', label: '胡！', style: 'accent', disabled: false },
      PASS: { key: 'PASS', label: '过', style: 'secondary', disabled: false },
      SHOW_HAND: { key: 'SHOW_HAND', label: '亮牌 x2', style: 'secondary', disabled: false },
      PEEK_ADVANCED_TILE: { key: 'PEEK_ADVANCED_TILE', label: '看一眼 (-2)', style: 'secondary', disabled: false },
      PUT_TILE_IN_HAND: { key: 'PUT_TILE_IN_HAND', label: '放进手牌', style: 'primary', disabled: false },
    }
    return map[action] ?? { key: action, label: action, style: 'secondary' as const, disabled: false }
  })

  // Add undo button after player discards (not during response window)
  if (game.canUndo && !game.isInResponseWindow) {
    btns.push({ key: 'UNDO', label: '撤回 (-4)', style: 'danger', disabled: false, hint: '下家出牌前可撤' })
  }

  return btns
})

const showWaiting = computed(() => game.isWaitingForBot && !game.isGameOver && !game.canUndo)

const countdown = computed(() => {
  if (!game.isInResponseWindow || !game.responseWindowInfo) return null
  return game.responseWindowInfo.secondsLeft
})

function handleClick(key: string) {
  if (key === 'RESTART') {
    game.joinGame('玩家')
    return
  }
  switch (key) {
    case 'DRAW_TILE': game.drawTile(false); break
    case 'DRAW_TILE_ADVANCED': game.drawTile(true); break
    case 'DISCARD_TILE': game.discardSelectedTile(); break
    case 'CLAIM_PONG':
      if (game.gameState?.lastDiscardedTile) game.claimPong(game.gameState.lastDiscardedTile.id)
      break
    case 'PASS': game.pass(); break
    case 'SHOW_HAND': game.showHand(); break
    case 'PEEK_ADVANCED_TILE': game.peekAdvancedTile(); break
    case 'PUT_TILE_IN_HAND':
      if (game.advancedTile) game.putTileInHand(game.advancedTile.id)
      break
    case 'UNDO':
      if (game.gameState?.lastDiscardedTile) game.requestUndo(game.gameState.lastDiscardedTile.id)
      break
    case 'URGE':
      // Find the current bot turn player
      if (game.gameState) {
        const currentBot = game.gameState.players.find(
          p => p.seatId === game.gameState!.currentTurnSeatId && p.playerType === 'bot'
        )
        if (currentBot) game.urgePlayer(currentBot.playerId)
      }
      break
  }
}
</script>

<template>
  <div class="action-bar" v-if="game.connected || showWaiting">
    <template v-if="showWaiting">
      <div class="waiting-text">等待电脑出牌...</div>
      <button class="action-btn btn-urge" @click="handleClick('URGE')">催一下</button>
    </template>
    <template v-else>
      <div v-if="countdown !== null" class="countdown-badge">{{ countdown }}s</div>
      <button
        v-for="btn in buttons"
        :key="btn.key"
        :class="['action-btn', `btn-${btn.style}`]"
        :disabled="btn.disabled"
        @click="handleClick(btn.key)"
      >
        {{ btn.label }}
      </button>
      <div v-if="buttons.some(b => b.hint)" class="action-hint">
        {{ buttons.find(b => b.hint)?.hint }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.action-bar {
  position: fixed;
  bottom: 154px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 6px 12px;
  pointer-events: auto;
  flex-wrap: wrap;
  max-width: min(100vw, 480px);
}

@media screen and (orientation: landscape) and (max-width: 950px) {
  .action-bar {
    bottom: 106px;
    gap: 8px;
  }

  .action-btn {
    min-width: 84px;
    height: 44px;
    font-size: 14px;
  }
}

.action-btn {
  min-width: 96px;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  color: #fff;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background: linear-gradient(145deg, #38db68, #15963e);
  box-shadow: 0 10px 22px rgba(39, 214, 89, 0.22);
}

.btn-secondary {
  background: linear-gradient(145deg, #6f879a, #425a6b);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
}

.btn-accent {
  background: linear-gradient(145deg, #ffb74d, #f57c00);
  box-shadow: 0 10px 22px rgba(255, 152, 0, 0.22);
}

.btn-danger {
  background: linear-gradient(145deg, #ff6b6b, #d32f2f);
  box-shadow: 0 10px 22px rgba(255, 87, 34, 0.22);
}

.btn-urge {
  background: linear-gradient(145deg, #ff7043, #d84315);
  box-shadow: 0 10px 22px rgba(255, 87, 34, 0.22);
  animation: urge-glow 1.5s ease infinite;
}

@keyframes urge-glow {
  0%, 100% { box-shadow: 0 10px 22px rgba(255, 87, 34, 0.22), 0 0 0 0 rgba(255, 87, 34, 0.3); }
  50% { box-shadow: 0 10px 22px rgba(255, 87, 34, 0.22), 0 0 0 8px rgba(255, 87, 34, 0); }
}

.waiting-text {
  color: #9fb2a5;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
}

.countdown-badge {
  position: absolute;
  top: -22px;
  right: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 152, 0, 0.14);
  color: #ffd166;
  font-size: 12px;
  font-weight: 700;
}

.action-hint {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(159, 178, 165, 0.6);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
</style>
