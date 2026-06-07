package com.kawuxing.websocket;

import com.kawuxing.game.action.*;
import com.kawuxing.game.core.GameService;
import com.kawuxing.game.score.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class GameSocketControllerTest {

    private GameSocketController controller;
    private GameService gameService;
    private GameMessagePublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new GameMessagePublisher() {
            @Override
            public void publishToRoom(String roomId, Object message) {
                // No-op for testing
            }

            @Override
            public void publishToPlayer(String playerId, Object message) {
                // No-op for testing
            }
        };

        BehaviorScoreService behaviorScoreService = new BehaviorScoreService();
        UrgeService urgeService = new UrgeService();
        UndoService undoService = new UndoService();
        FavorService favorService = new FavorService();
        LeakService leakService = new LeakService();

        gameService = new GameService(publisher, behaviorScoreService, urgeService, undoService, favorService, leakService);
        controller = new GameSocketController(gameService);
    }

    @Test
    void handleAction_joinRoom_doesNotThrow() {
        JoinRoomAction action = new JoinRoomAction("1", "a1", "main", "p1", "Player 1");
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_drawTile_doesNotThrow() {
        // First join a room
        JoinRoomAction joinAction = new JoinRoomAction("1", "a1", "main", "p1", "Player 1");
        controller.handleAction(joinAction);

        DrawTileAction action = new DrawTileAction("1", "a2", "main", "p1", false);
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_discardTile_doesNotThrow() {
        // Join and draw first
        controller.handleAction(new JoinRoomAction("1", "a1", "main", "p1", "Player 1"));
        controller.handleAction(new DrawTileAction("1", "a2", "main", "p1", false));

        // Note: This might not actually discard if the state isn't right,
        // but it shouldn't throw
        DiscardTileAction action = new DiscardTileAction("1", "a3", "main", "p1", "tile_001");
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_claimPong_doesNotThrow() {
        ClaimPongAction action = new ClaimPongAction("1", "a4", "main", "p1", "tile_001");
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_claimWin_doesNotThrow() {
        ClaimWinAction action = new ClaimWinAction("1", "a5", "main", "p1", null);
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_showHand_doesNotThrow() {
        controller.handleAction(new JoinRoomAction("1", "a1", "main", "p1", "Player 1"));

        ShowHandAction action = new ShowHandAction("1", "a6", "main", "p1");
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_urgePlayer_doesNotThrow() {
        controller.handleAction(new JoinRoomAction("1", "a1", "main", "p1", "Player 1"));

        UrgePlayerAction action = new UrgePlayerAction("1", "a7", "main", "p1", "bot_1");
        assertDoesNotThrow(() -> controller.handleAction(action));
    }

    @Test
    void handleAction_requestUndoDiscard_doesNotThrow() {
        RequestUndoDiscardAction action = new RequestUndoDiscardAction("1", "a8", "main", "p1", "tile_001");
        assertDoesNotThrow(() -> controller.handleAction(action));
    }
}
