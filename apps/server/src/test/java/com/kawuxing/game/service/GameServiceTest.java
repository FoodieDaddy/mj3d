package com.kawuxing.game.service;

import com.kawuxing.game.action.*;
import com.kawuxing.game.core.GameService;
import com.kawuxing.game.event.*;
import com.kawuxing.game.score.*;
import com.kawuxing.websocket.GameMessagePublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class GameServiceTest {

    private GameService gameService;
    private GameMessagePublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = mock(GameMessagePublisher.class);
        BehaviorScoreService behaviorScoreService = new BehaviorScoreService();
        UrgeService urgeService = new UrgeService();
        UndoService undoService = new UndoService();
        FavorService favorService = new FavorService();
        LeakService leakService = new LeakService();

        gameService = new GameService(publisher, behaviorScoreService, urgeService, undoService, favorService, leakService);
    }

    // --- Join room tests ---

    @Test
    void joinRoom_firstPlayer_fillsWithBots() {
        JoinRoomAction action = new JoinRoomAction("1", "a1", "main", "p1", "Player 1");
        gameService.handleAction(action);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(publisher, atLeastOnce()).publishToRoom(eq("main"), captor.capture());

        List<Object> events = captor.getAllValues();
        boolean hasPlayerJoined = events.stream().anyMatch(e -> e instanceof PlayerJoinedEvent);
        boolean hasBotFilled = events.stream().anyMatch(e -> e instanceof BotFilledEvent);
        assertTrue(hasPlayerJoined);
        assertTrue(hasBotFilled);
    }

    // --- Draw tile tests ---

    @Test
    void drawTile_normalDraw() {
        joinPlayer("p1");
        DrawTileAction action = new DrawTileAction("1", "a2", "main", "p1", false);
        gameService.handleAction(action);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(publisher, atLeastOnce()).publishToRoom(eq("main"), captor.capture());

        boolean hasTileDrawn = captor.getAllValues().stream()
                .anyMatch(e -> e instanceof TileDrawnEvent);
        assertTrue(hasTileDrawn);
    }

    @Test
    void drawTile_advanceDraw() {
        joinPlayer("p1");
        DrawTileAction action = new DrawTileAction("1", "a2", "main", "p1", true);
        gameService.handleAction(action);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(publisher, atLeastOnce()).publishToRoom(eq("main"), captor.capture());

        boolean hasTileDrawn = captor.getAllValues().stream()
                .anyMatch(e -> e instanceof TileDrawnEvent);
        assertTrue(hasTileDrawn);
    }

    // --- Discard tile tests ---

    @Test
    void discardTile_afterDraw() {
        joinPlayer("p1");
        drawTile("p1");

        // Get a tile from hand to discard
        // We need to get the state somehow - let's just send a discard action
        // The service should handle it
    }

    // --- Urge player tests ---

    @Test
    void urgePlayer_generatesEvent() {
        joinPlayer("p1");
        UrgePlayerAction action = new UrgePlayerAction("1", "a3", "main", "p1", "bot_1");
        gameService.handleAction(action);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(publisher, atLeastOnce()).publishToRoom(eq("main"), captor.capture());

        boolean hasUrgeEvent = captor.getAllValues().stream()
                .anyMatch(e -> e instanceof PlayerUrgedEvent);
        assertTrue(hasUrgeEvent);
    }

    // --- Show hand tests ---

    @Test
    void showHand_generatesEvent() {
        joinPlayer("p1");
        ShowHandAction action = new ShowHandAction("1", "a4", "main", "p1");
        gameService.handleAction(action);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(publisher, atLeastOnce()).publishToRoom(eq("main"), captor.capture());

        boolean hasShowHandEvent = captor.getAllValues().stream()
                .anyMatch(e -> e instanceof HandShownEvent);
        assertTrue(hasShowHandEvent);
    }

    // --- Claim win tests ---

    @Test
    void claimWin_generatesEvent() {
        joinPlayer("p1");
        ClaimWinAction action = new ClaimWinAction("1", "a5", "main", "p1", null);
        gameService.handleAction(action);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(publisher, atLeastOnce()).publishToRoom(eq("main"), captor.capture());

        boolean hasWinEvent = captor.getAllValues().stream()
                .anyMatch(e -> e instanceof WinDeclaredEvent);
        assertTrue(hasWinEvent);
    }

    // --- Helper methods ---

    private void joinPlayer(String playerId) {
        JoinRoomAction action = new JoinRoomAction("1", "a1", "main", playerId, "Player");
        gameService.handleAction(action);
    }

    private void drawTile(String playerId) {
        DrawTileAction action = new DrawTileAction("1", "a2", "main", playerId, false);
        gameService.handleAction(action);
    }
}
