<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { formatGameEvent } from '@kawuxing/web-core'
import GameScene from '../3d/components/GameScene.vue'
import GameStatusBanner from '../components/GameStatusBanner.vue'
import SeatHudLayer from '../components/SeatHudLayer.vue'
import CurrentDiscardPanel from '../components/CurrentDiscardPanel.vue'
import DiscardAreaLayer from '../components/DiscardAreaLayer.vue'
import ActionBar from '../components/ActionBar.vue'
import GameplayHandLayer from '../components/GameplayHandLayer.vue'
import MeldAreaLayer from '../components/MeldAreaLayer.vue'
import TileFlyAnimation from '../components/TileFlyAnimation.vue'
import LeakIndicator from '../components/LeakIndicator.vue'
import UrgeBubble from '../components/UrgeBubble.vue'
import ShowHandConfirmDialog from '../components/ShowHandConfirmDialog.vue'
import RoundResultDialog from '../components/RoundResultDialog.vue'
import PongDialog from '../components/PongDialog.vue'

const game = useGameStore()
const showDebug = ref(false)
const eventLogExpanded = ref(false)

onMounted(() => {
  game.joinGame('玩家')
})

function handleStart() {
  game.joinGame('玩家')
}

function getFormattedEvents() {
  if (!game.gameState) return []
  const limit = eventLogExpanded.value ? 20 : 6
  return game.events.slice(-limit).map(e =>
    formatGameEvent(e, game.gameState!.players, game.playerId ?? '')
  )
}
</script>

<template>
  <div class="game-shell">
    <!-- 加载状态 -->
    <div v-if="!game.connected" class="loading-text">加载中...</div>

    <!-- 3D 场景 -->
    <GameScene v-if="game.connected" />

    <!-- UI 层 -->
    <GameStatusBanner />
    <SeatHudLayer />
    <CurrentDiscardPanel />
    <DiscardAreaLayer />
    <MeldAreaLayer />

    <!-- 事件日志 -->
    <div class="event-log" @click="eventLogExpanded = !eventLogExpanded">
      <div v-for="(msg, i) in getFormattedEvents()" :key="i" class="log-line">{{ msg }}</div>
      <div class="log-expand-hint">{{ eventLogExpanded ? '收起' : '展开' }}</div>
    </div>

    <!-- 操作栏 -->
    <ActionBar />

    <!-- 出牌飞行动画 -->
    <TileFlyAnimation />

    <!-- 漏牌指示器 -->
    <LeakIndicator />

    <!-- 催促气泡 -->
    <UrgeBubble />

    <!-- 手牌层 -->
    <GameplayHandLayer />

    <!-- Debug (默认折叠) -->
    <div v-if="showDebug" class="debug-overlay">
      <div class="debug-title" @click="showDebug = false">DEBUG ✕</div>
      <div class="debug-row"><span class="dk">stage</span><span class="dv">{{ game.gameState?.nextPlayerStage }}</span></div>
      <div class="debug-row"><span class="dk">seat</span><span class="dv">{{ game.gameState?.currentTurnSeatId }}</span></div>
      <div class="debug-row"><span class="dk">hand</span><span class="dv">{{ game.myHandTiles.length }}</span></div>
      <div class="debug-row"><span class="dk">advanced</span><span class="dv">{{ game.advancedTile?.id ?? 'null' }}</span></div>
      <div class="debug-row"><span class="dk">selected</span><span class="dv">{{ game.selectedTileId ?? '-' }}</span></div>
      <div class="debug-row"><span class="dk">legal</span><span class="dv">{{ game.legalActions.join(', ') }}</span></div>
      <div class="debug-row"><span class="dk">wall</span><span class="dv">{{ game.wallCount }}</span></div>
      <div class="debug-row"><span class="dk">isShowHand</span><span class="dv">{{ game.myPlayer?.isShowHand ?? false }}</span></div>
      <div class="debug-row"><span class="dk">behaviorScore</span><span class="dv">{{ game.behaviorScore }}</span></div>
      <div class="debug-row"><span class="dk">responseWindow</span><span class="dv">{{ game.isInResponseWindow ? 'yes' : 'no' }}</span></div>
      <div class="debug-row"><span class="dk">canUndo</span><span class="dv">{{ game.canUndo }}</span></div>
      <div class="debug-row"><span class="dk">melds</span><span class="dv">{{ game.myPlayer?.meldGroups.length ?? 0 }}</span></div>
    </div>
    <button v-else class="debug-toggle" @click="showDebug = true">调试</button>

    <!-- 竖屏提示 -->
    <div class="rotate-tip">
      <div class="rotate-card">
        <span class="rotate-icon">📱</span>
        <p>请横屏游玩</p>
      </div>
    </div>

    <!-- 弹窗 -->
    <PongDialog
      :tile="game.pongTile"
      @pong="() => game.gameState?.lastDiscardedTile && game.claimPong(game.gameState.lastDiscardedTile.id)"
      @pass="() => game.pass()"
    />
    <ShowHandConfirmDialog
      v-if="game.showShowHandDialog"
      @confirm="game.confirmShowHand"
      @cancel="game.cancelShowHand"
    />
    <RoundResultDialog
      v-if="game.isGameOver"
      @restart="handleStart"
    />
  </div>
</template>

<style scoped>
.game-shell {
  --panel: rgba(7, 20, 14, 0.72);
  --panel-border: rgba(255, 255, 255, 0.12);
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
  --green: #55d86a;
  --green-dim: rgba(85, 216, 106, 0.14);
  --gold: #ffd166;
  --muted: #9fb2a5;

  width: 100vw;
  height: 100dvh;
  margin: 0;
  overflow: hidden;
  position: relative;
  color: #f3f7f4;
  background:
    radial-gradient(circle at center 48%, rgba(38, 115, 62, 0.8), rgba(4, 55, 25, 0.95) 38%, #052311 72%),
    #071f13;
  box-shadow: inset 0 0 90px rgba(0, 0, 0, 0.45);
}

.game-shell::before {
  content: "";
  position: absolute;
  inset: 27% 15% 11%;
  border: 44px solid rgba(112, 222, 111, 0.4);
  border-radius: 50%;
  opacity: 0.75;
  filter: drop-shadow(0 0 30px rgba(80, 255, 127, 0.12));
  pointer-events: none;
}


.event-log {
  position: absolute;
  right: 12px;
  bottom: 215px;
  z-index: 50;
  pointer-events: auto;
  width: 180px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(0, 10, 6, 0.68);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
  cursor: pointer;
}

.event-log::before {
  content: "对局记录";
  display: block;
  margin-bottom: 6px;
  color: #9dffac;
  font-size: 12px;
  font-weight: 800;
}

.log-line {
  color: #d9e8dc;
  font-size: 12px;
  line-height: 1.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-expand-hint {
  font-size: 10px;
  color: rgba(159, 178, 165, 0.6);
  text-align: center;
  margin-top: 4px;
}

.debug-overlay {
  position: absolute;
  top: 60px;
  left: 8px;
  z-index: 200;
  pointer-events: auto;
  background: rgba(0, 10, 6, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 10px 12px;
  border-radius: 14px;
  font-family: monospace;
  font-size: 10px;
  color: #9dffac;
  min-width: 180px;
}

.debug-title {
  cursor: pointer;
  margin-bottom: 4px;
}

.debug-row { display: flex; gap: 6px; line-height: 1.6; }
.dk { color: rgba(159, 178, 165, 0.6); min-width: 70px; }
.dv { color: #9dffac; }

.debug-toggle {
  position: absolute;
  top: 60px;
  left: 8px;
  z-index: 200;
  pointer-events: auto;
  background: rgba(0, 10, 6, 0.5);
  color: var(--muted, #9fb2a5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  font-size: 10px;
  cursor: pointer;
  border-radius: 10px;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.debug-toggle:hover {
  background: rgba(0, 10, 6, 0.7);
  color: #9dffac;
  border-color: rgba(85, 216, 106, 0.4);
}

.rotate-tip {
  display: none;
}

@media screen and (orientation: portrait) and (max-width: 900px) {
  .rotate-tip {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at top, rgba(44, 199, 91, 0.2), transparent 40%),
      rgba(2, 10, 6, 0.92);
  }
}

.rotate-card {
  text-align: center;
  padding: 28px 24px;
  border-radius: 24px;
  background: rgba(4, 32, 17, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(14px);
}

.rotate-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
  transform: rotate(90deg);
}

.rotate-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  font-weight: 600;
}

.loading-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9998;
  color: #9dffac;
  font-size: 18px;
  font-weight: 700;
}

/* 横屏布局适配 */
@media screen and (orientation: landscape) and (max-width: 950px) {
  .event-log {
    right: 16px;
    bottom: 118px;
    width: 170px;
  }

  .debug-overlay,
  .debug-toggle {
    top: 56px;
  }
}
</style>
