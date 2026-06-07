<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const game = useGameStore()

function suitLabel(suit: string): string {
  switch (suit) {
    case 'wan': return '万'
    case 'tiao': return '条'
    case 'tong': return '筒'
    default: return ''
  }
}

const statusText = computed(() => {
  if (!game.connected) return '点击开始游戏'
  if (game.isGameOver) {
    return game.isMyWin ? '恭喜你赢了！' : '游戏结束'
  }

  // Response window
  if (game.isInResponseWindow) {
    const rw = game.responseWindowInfo
    if (rw) {
      const discarder = game.gameState?.players.find(p => p.playerId === rw.discardPlayerId)
      const discarderName = discarder?.playerId === game.playerId ? '你' : (discarder?.playerName ?? '')
      const tileLabel = `${rw.discardTileValue}${suitLabel(rw.discardTileSuit)}`

      if (rw.canIPong) {
        return `${discarderName} 打出 ${tileLabel}，你可以碰！`
      }
      if (rw.myResponse === 'PONG') return '你碰牌了！请选择出牌'
      if (rw.myResponse === 'PASS') return `等待其他玩家响应...`
      return `${discarderName} 打出 ${tileLabel}，等待响应...`
    }
  }

  if (game.isWaitingForBot) {
    const bot = game.gameState?.players.find(
      p => p.seatId === game.gameState?.currentTurnSeatId
    )
    return `等待${bot?.playerName ?? '电脑'}出牌...`
  }
  if (game.isMyTurn) {
    const stage = game.gameState?.nextPlayerStage
    if (stage === 'beforeDraw') return '轮到你：请选择摸牌方式'
    if (game.hasAdvancedTile && !game.hasPeekedAdvanced) return '你提前拿了一张牌：选择看牌或放入手牌'
    if (game.hasAdvancedTile && game.hasPeekedAdvanced) return '你已看牌：放入手牌后出牌'
    if (stage === 'inHand' && game.selectedTileId) return '已选牌：点击「出牌」确认'
    if (stage === 'inHand') return '你已摸牌：请选择一张牌打出'
    return '你的回合'
  }
  if (game.gameState?.nextPlayerStage === 'discarded' && game.canPongDiscard) {
    const tile = game.gameState.lastDiscardedTile
    const label = tile ? `${tile.value}${suitLabel(tile.suit)}` : ''
    return `你可以碰：${label}`
  }
  return '等待对手...'
})
</script>

<template>
  <div class="status-banner" v-if="game.connected">
    <span v-if="game.isMyTurn" class="status-badge">轮到你</span>
    <span v-else-if="game.isInResponseWindow" class="status-badge badge-orange">响应中</span>
    <div class="status-text">{{ statusText }}</div>
  </div>
</template>

<style scoped>
.status-banner {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 40;
  transform: translateX(-50%);
  width: min(420px, calc(100% - 28px));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(1, 18, 8, 0.72);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
  pointer-events: none;
}

@media screen and (orientation: landscape) and (max-width: 950px) {
  .status-banner {
    top: 8px;
    width: min(520px, calc(100vw - 32px));
    padding: 8px 14px;
  }
}

.status-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(85, 216, 106, 0.14);
  color: #9dffac;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.badge-orange {
  background: rgba(255, 152, 0, 0.14);
  color: #ffd166;
}

.status-text {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
