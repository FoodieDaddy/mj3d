<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { Tile } from '@kawuxing/protocol'

const game = useGameStore()

const tiles = computed(() => game.displayHandTiles)
const selectedId = computed(() => game.selectedTileId)
const canDiscard = computed(() => game.canDiscard)
const isInResponseWindow = computed(() => game.isInResponseWindow)

function suitLabel(suit: string): string {
  switch (suit) {
    case 'wan': return '万'
    case 'tiao': return '条'
    case 'tong': return '筒'
    default: return ''
  }
}

function suitColor(suit: string): string {
  switch (suit) {
    case 'wan': return '#d32f2f'
    case 'tiao': return '#2e7d32'
    case 'tong': return '#1565c0'
    default: return '#fff'
  }
}

function suitBg(suit: string): string {
  switch (suit) {
    case 'wan': return '#fff8f8'
    case 'tiao': return '#f1f8e9'
    case 'tong': return '#e3f2fd'
    default: return '#f5f0e8'
  }
}

function tileKey(tile: Tile): string {
  return tile.id
}

function handleTileClick(tileId: string) {
  game.selectTile(tileId)
}

function handleDiscard() {
  game.discardSelectedTile()
}

const isShowHand = computed(() => game.myPlayer?.isShowHand ?? false)
</script>

<template>
  <div class="hand-layer" v-if="game.connected && !game.isGameOver">
    <!-- 亮牌状态 -->
    <div v-if="isShowHand" class="show-hand-badge">已亮牌 x2</div>

    <div class="hand-tiles">
      <button
        v-for="tile in tiles"
        :key="tileKey(tile)"
        class="tile-card"
        :class="{
          selected: tile.id === selectedId,
          'is-advanced': tile.id === game.advancedTile?.id,
          'can-discard': canDiscard && !isInResponseWindow,
        }"
        :style="{ '--suit-color': suitColor(tile.suit), '--suit-bg': suitBg(tile.suit) }"
        @click="handleTileClick(tile.id)"
      >
        <span class="tile-value">{{ tile.value }}</span>
        <span class="tile-suit">{{ suitLabel(tile.suit) }}</span>
      </button>
    </div>
    <div class="hand-actions">
      <button
        class="discard-btn"
        :disabled="!selectedId || !canDiscard"
        @click="handleDiscard"
      >
        {{ selectedId ? '出这张' : '请选牌' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.hand-layer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  pointer-events: auto;
  padding: 20px 12px 16px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.58) 36%, rgba(0, 0, 0, 0.76));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.show-hand-badge {
  background: linear-gradient(135deg, #ffb74d 0%, #f57c00 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.25);
}

.hand-tiles {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 6px;
  overflow-x: auto;
  max-width: 100%;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.hand-tiles::-webkit-scrollbar {
  display: none;
}

.tile-card {
  flex-shrink: 0;
  position: relative;
  width: 60px;
  height: 90px;
  border: 0;
  border-radius: 12px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(232, 230, 218, 0.98));
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  padding: 2px;
}

.tile-card:hover {
  transform: translateY(-10px);
  box-shadow:
    0 16px 28px rgba(0, 0, 0, 0.44),
    0 0 0 2px rgba(255, 255, 255, 0.42);
}

.tile-card:active {
  transform: scale(0.96);
}

.tile-card.can-discard {
  animation: tile-glow 2s infinite;
}

.tile-card.selected {
  transform: translateY(-24px);
  box-shadow:
    0 20px 32px rgba(0, 0, 0, 0.5),
    0 0 0 3px rgba(255, 209, 102, 0.95),
    0 0 24px rgba(255, 209, 102, 0.32);
}

.tile-card.is-advanced {
  border: 2px dashed #f57c00;
  margin-left: 8px;
}

.tile-card.is-advanced::after {
  content: '提前';
  position: absolute;
  top: -8px;
  right: -4px;
  font-size: 8px;
  background: linear-gradient(135deg, #ffb74d, #f57c00);
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: 700;
}

.tile-value {
  font-size: 26px;
  font-weight: 1000;
  line-height: 1;
  color: var(--suit-color);
}

.tile-suit {
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  margin-top: 3px;
  color: var(--suit-color);
  opacity: 0.8;
}

.hand-actions {
  display: flex;
  gap: 8px;
}

.discard-btn {
  min-width: 118px;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.03em;
  cursor: pointer;
  background: linear-gradient(145deg, #38db68, #15963e);
  color: white;
  box-shadow: 0 10px 22px rgba(39, 214, 89, 0.22);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.discard-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.discard-btn:active:not(:disabled) {
  transform: translateY(0);
}

.discard-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background: linear-gradient(145deg, #6f879a, #425a6b);
}

@keyframes tile-glow {
  0%, 100% { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35); }
  50% { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35), 0 0 12px rgba(85, 216, 106, 0.3); }
}

@media screen and (orientation: landscape) and (max-width: 950px) {
  .hand-layer {
    padding: 12px 10px 10px;
    gap: 6px;
  }

  .tile-card {
    width: 50px;
    height: 74px;
    border-radius: 10px;
  }

  .tile-value {
    font-size: 22px;
  }

  .tile-suit {
    font-size: 11px;
  }

  .hand-tiles {
    gap: 4px;
  }

  .discard-btn {
    min-width: 96px;
    height: 44px;
    font-size: 14px;
  }
}
</style>
