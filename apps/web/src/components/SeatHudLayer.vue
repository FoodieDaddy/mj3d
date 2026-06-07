<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { SeatId } from '@kawuxing/protocol'

const game = useGameStore()

interface SeatInfo {
  seatId: SeatId
  name: string
  handCount: number
  behaviorScore: number
  isCurrentTurn: boolean
  isBot: boolean
  isThinking: boolean
  position: 'bottom-left' | 'top-left' | 'top-right'
  responseStatus: string | null
}

const seats = computed<SeatInfo[]>(() => {
  if (!game.gameState) return []
  return game.gameState.players.map((p) => {
    const isCurrentTurn = game.gameState!.currentTurnSeatId === p.seatId
    const isBot = p.playerType === 'bot'
    const isThinking = isBot && isCurrentTurn && game.gameState!.nextPlayerStage !== 'discarded' && game.gameState!.nextPlayerStage !== 'responseWindow'

    // Check if this player is responding in response window
    let responseStatus: string | null = null
    if (game.isInResponseWindow && game.responseWindowInfo) {
      const rw = game.responseWindowInfo
      if (rw.discardPlayerId === p.playerId) {
        responseStatus = '打出牌'
      } else if (rw.eligiblePlayerIds.includes(p.playerId)) {
        if (rw.myResponse && p.playerId === game.playerId) {
          responseStatus = rw.myResponse === 'PONG' ? '碰！' : '过'
        } else if (p.playerId !== game.playerId) {
          responseStatus = '思考中...'
        }
      }
    }

    let position: SeatInfo['position'] = 'bottom-left'
    if (p.seatId === 1) position = 'top-left'
    if (p.seatId === 2) position = 'top-right'

    let handCount = p.handTiles.length
    if (p.playerId !== game.playerId) {
      handCount = isCurrentTurn && game.gameState!.nextPlayerStage === 'inHand' ? 14 : 13
    }

    return {
      seatId: p.seatId,
      name: p.playerId === game.playerId ? '你' : p.playerName,
      handCount,
      behaviorScore: p.behaviorScore,
      isCurrentTurn,
      isBot,
      isThinking: isThinking || (isBot && responseStatus === '思考中...'),
      position,
      responseStatus,
    }
  })
})
</script>

<template>
  <div class="seat-hud" v-if="game.connected">
    <div
      v-for="seat in seats"
      :key="seat.seatId"
      class="seat-card"
      :class="[`pos-${seat.position}`, { active: seat.isCurrentTurn }]"
    >
      <div class="seat-name">
        <span class="avatar">{{ seat.name === '你' ? '你' : seat.name.charAt(seat.name.length - 1) }}</span>
        {{ seat.name }}
      </div>
      <div class="seat-meta">手牌 {{ seat.handCount }} · 行为分 {{ seat.behaviorScore }}</div>
      <div v-if="seat.responseStatus" class="seat-response" :class="{ 'is-pong': seat.responseStatus === '碰！' }">{{ seat.responseStatus }}</div>
      <div v-else-if="seat.isThinking" class="seat-thinking">思考中...</div>
      <div v-if="seat.isCurrentTurn && !seat.responseStatus" class="seat-turn-indicator">当前操作中</div>
    </div>
  </div>
</template>

<style scoped>
.seat-hud {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
}

.seat-card {
  position: absolute;
  width: 170px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(7, 20, 14, 0.72);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 38px rgba(0, 0, 0, 0.28);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.seat-card.active {
  border-color: rgba(85, 216, 106, 0.45);
  box-shadow: 0 0 0 1px rgba(85, 216, 106, 0.22), 0 12px 38px rgba(0, 0, 0, 0.3);
}

.pos-bottom-left {
  bottom: 210px;
  left: 12px;
}

.pos-top-left {
  top: 60px;
  left: 12px;
}

.pos-top-right {
  top: 60px;
  right: 12px;
}

@media screen and (orientation: landscape) and (max-width: 950px) {
  .seat-card {
    width: 150px;
    padding: 10px;
  }

  .pos-bottom-left {
    bottom: 118px;
    left: 16px;
  }

  .pos-top-left {
    top: 56px;
    left: 16px;
  }

  .pos-top-right {
    top: 56px;
    right: 16px;
  }
}

.seat-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 6px;
}

.avatar {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #46e96c, #11853d);
  color: #04220f;
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
}

.seat-meta {
  font-size: 12px;
  color: #9fb2a5;
  line-height: 1.6;
}

.seat-thinking {
  font-size: 12px;
  color: #ffd166;
  margin-top: 4px;
  animation: pulse 1.2s infinite;
}

.seat-turn-indicator {
  font-size: 11px;
  color: #7fff96;
  margin-top: 4px;
}

.seat-response {
  font-size: 12px;
  color: #ffd166;
  margin-top: 4px;
  font-weight: 700;
}

.seat-response.is-pong {
  color: #55d86a;
  animation: pong-flash 0.5s ease;
}

@keyframes pong-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
