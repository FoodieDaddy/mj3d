<script setup lang="ts">
import { computed } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { useGameStore } from '../../stores/game'
import GameTable from './GameTable.vue'
import HandTiles from './HandTiles.vue'
import DiscardPile from './DiscardPile.vue'
import AdvancedTile from './AdvancedTile.vue'
import WallTiles from './WallTiles.vue'
import SeatFocusRing from './SeatFocusRing.vue'
import CurrentDiscardTile3D from './CurrentDiscardTile3D.vue'
import { CAMERA_POSITION, CAMERA_LOOK_AT } from '../utils/constants'

const game = useGameStore()
const camPos: [number, number, number] = CAMERA_POSITION
const camLookAt: [number, number, number] = CAMERA_LOOK_AT

const wallCount = computed(() => game.gameState?.wallTiles.length ?? 0)

const discardedTiles = computed(() => {
  if (!game.gameState) return []
  return game.gameState.players.flatMap((p) => p.discardedTiles)
})

function handleTileSelect(tileId: string) {
  game.selectTile(tileId)
}

function handleTileDiscard(tileId: string) {
  if (game.canDiscard) {
    game.discardTile(tileId)
    game.selectedTileId = null
  }
}

function handlePeek() {
  game.peekAdvancedTile()
}

function handlePutInHand(tileId: string) {
  game.putTileInHand(tileId)
}
</script>

<template>
  <TresCanvas
    shadows
    clear-color="#0a0a1a"
  >
    <TresPerspectiveCamera
      :position="camPos"
      :look-at="camLookAt"
    />

    <!-- Lighting -->
    <TresAmbientLight :intensity="0.8" />
    <TresDirectionalLight
      :position="[5, 10, 5]"
      :intensity="1.0"
      cast-shadow
    />
    <TresPointLight :position="[0, 6, 0]" :intensity="0.5" />
    <TresPointLight :position="[0, 2, 4]" :intensity="0.3" />

    <!-- Table -->
    <GameTable />

    <!-- Seat focus ring -->
    <SeatFocusRing />

    <!-- Current discard tile 3D -->
    <CurrentDiscardTile3D />

    <!-- Wall tiles -->
    <WallTiles :count="wallCount" />

    <!-- Player hand tiles -->
    <HandTiles
      :tiles="game.myHandTiles"
      :selected-tile-id="game.selectedTileId"
      :is-my-turn="game.isMyTurn"
      @select="handleTileSelect"
      @discard="handleTileDiscard"
    />

    <!-- Advanced tile (if any) -->
    <AdvancedTile
      v-if="game.hasAdvancedTile"
      :tile="game.advancedTile"
      :peeked="game.myPlayer?.hasPeekedAdvanced ?? false"
      @peek="handlePeek"
      @put-in-hand="handlePutInHand"
    />

    <!-- Discard pile -->
    <DiscardPile :tiles="discardedTiles" />
  </TresCanvas>
</template>
