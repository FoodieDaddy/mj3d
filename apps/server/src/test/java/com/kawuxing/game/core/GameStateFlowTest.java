package com.kawuxing.game.core;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class GameStateFlowTest {

    private GameState state;

    @BeforeEach
    void setUp() {
        state = new GameState("main", "game_001");
        state.getPlayers().add(new PlayerState("p1", 0, "Player 1", "human"));
        state.getPlayers().add(new PlayerState("p2", 1, "Bot 1", "bot"));
        state.getPlayers().add(new PlayerState("p3", 2, "Bot 2", "bot"));
        state.startGame();
    }

    // --- Join room tests ---

    @Test
    void startGame_deals13TilesPerPlayer() {
        for (PlayerState p : state.getPlayers()) {
            assertEquals(13, p.getHandTiles().size());
        }
    }

    @Test
    void startGame_wallHasCorrectSize() {
        // 108 - 39 = 69
        assertEquals(69, state.getWallTiles().size());
    }

    @Test
    void maxThreePlayers() {
        GameState s = new GameState("main", "game_002");
        s.getPlayers().add(new PlayerState("p1", 0, "A", "human"));
        s.getPlayers().add(new PlayerState("p2", 1, "B", "bot"));
        s.getPlayers().add(new PlayerState("p3", 2, "C", "bot"));
        assertEquals(3, s.getPlayers().size());
    }

    // --- Draw tile tests ---

    @Test
    void drawTile_removesFromWall() {
        int wallBefore = state.getWallTiles().size();
        state.drawTile();
        assertEquals(wallBefore - 1, state.getWallTiles().size());
    }

    @Test
    void drawTile_returnsNullWhenEmpty() {
        state.getWallTiles().clear();
        assertNull(state.drawTile());
    }

    // --- Discard tile tests ---

    @Test
    void discardTile_movesFromHandToDiscarded() {
        PlayerState player = state.getPlayers().get(0);
        String tileId = player.getHandTiles().get(0).getId();
        Tile tile = state.discardTile(player, tileId);
        assertNotNull(tile);
        assertEquals(12, player.getHandTiles().size());
        assertEquals(1, player.getDiscardedTiles().size());
    }

    @Test
    void discardTile_invalidTileId_returnsNull() {
        PlayerState player = state.getPlayers().get(0);
        assertNull(state.discardTile(player, "nonexistent"));
    }

    // --- Advance turn tests ---

    @Test
    void advanceTurn_cyclesSeats() {
        assertEquals(0, state.getCurrentTurnSeatId());
        state.advanceTurn();
        assertEquals(1, state.getCurrentTurnSeatId());
        state.advanceTurn();
        assertEquals(2, state.getCurrentTurnSeatId());
        state.advanceTurn();
        assertEquals(0, state.getCurrentTurnSeatId());
    }

    @Test
    void advanceTurn_resetsStage() {
        state.setNextPlayerStage("discarded");
        state.advanceTurn();
        assertEquals("beforeDraw", state.getNextPlayerStage());
    }

    // --- Pong tests ---

    @Test
    void canPong_withTwoMatchingTiles() {
        PlayerState player = state.getPlayers().get(0);
        player.getHandTiles().clear();
        Tile discarded = new Tile("test_001", "wan", 5);
        state.setLastDiscardedTile(discarded);

        // Add two matching tiles to hand
        player.getHandTiles().add(new Tile("test_002", "wan", 5));
        player.getHandTiles().add(new Tile("test_003", "wan", 5));

        assertTrue(state.canPong(player));
    }

    @Test
    void canPong_withOneMatchingTile_false() {
        PlayerState player = state.getPlayers().get(0);
        player.getHandTiles().clear();
        Tile discarded = new Tile("test_001", "wan", 5);
        state.setLastDiscardedTile(discarded);

        player.getHandTiles().add(new Tile("test_002", "wan", 5));
        assertFalse(state.canPong(player));
    }

    @Test
    void canPong_noDiscardedTile_false() {
        PlayerState player = state.getPlayers().get(0);
        player.getHandTiles().clear();
        assertFalse(state.canPong(player));
    }

    // --- Kong tests ---

    @Test
    void canKong_withThreeMatchingTiles() {
        PlayerState player = state.getPlayers().get(0);
        player.getHandTiles().clear();
        Tile discarded = new Tile("test_001", "wan", 5);
        state.setLastDiscardedTile(discarded);

        player.getHandTiles().add(new Tile("test_002", "wan", 5));
        player.getHandTiles().add(new Tile("test_003", "wan", 5));
        player.getHandTiles().add(new Tile("test_004", "wan", 5));

        assertTrue(state.canKong(player));
    }

    @Test
    void canKong_withTwoMatchingTiles_false() {
        PlayerState player = state.getPlayers().get(0);
        player.getHandTiles().clear();
        Tile discarded = new Tile("test_001", "wan", 5);
        state.setLastDiscardedTile(discarded);

        player.getHandTiles().add(new Tile("test_002", "wan", 5));
        player.getHandTiles().add(new Tile("test_003", "wan", 5));

        assertFalse(state.canKong(player));
    }

    // --- Undo discard tests ---

    @Test
    void undoDiscard_movesTileBackToHand() {
        PlayerState player = state.getPlayers().get(0);
        Tile tile = player.getHandTiles().get(0);
        String tileId = tile.getId();

        state.discardTile(player, tileId);
        assertEquals(12, player.getHandTiles().size());
        assertEquals(1, player.getDiscardedTiles().size());

        state.undoDiscard(player, tileId);
        assertEquals(13, player.getHandTiles().size());
        assertEquals(0, player.getDiscardedTiles().size());
    }

    @Test
    void undoDiscard_invalidTileId_noChange() {
        PlayerState player = state.getPlayers().get(0);
        state.undoDiscard(player, "nonexistent");
        assertEquals(13, player.getHandTiles().size());
    }

    // --- Player lookup tests ---

    @Test
    void getPlayerById_found() {
        assertNotNull(state.getPlayerById("p1"));
        assertEquals("Player 1", state.getPlayerById("p1").getPlayerName());
    }

    @Test
    void getPlayerById_notFound() {
        assertNull(state.getPlayerById("nonexistent"));
    }
}
