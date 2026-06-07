package com.kawuxing.game.core;

import com.kawuxing.game.action.*;
import com.kawuxing.game.event.*;
import com.kawuxing.game.score.*;
import com.kawuxing.websocket.GameMessagePublisher;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private final GameMessagePublisher publisher;
    private final BehaviorScoreService behaviorScoreService;
    private final UrgeService urgeService;
    private final UndoService undoService;
    private final FavorService favorService;
    private final LeakService leakService;

    private final Map<String, GameState> games = new ConcurrentHashMap<>();
    private final Map<String, String> playerRooms = new ConcurrentHashMap<>();

    private static final String ROOM_ID = "main";

    public GameService(GameMessagePublisher publisher,
                       BehaviorScoreService behaviorScoreService,
                       UrgeService urgeService,
                       UndoService undoService,
                       FavorService favorService,
                       LeakService leakService) {
        this.publisher = publisher;
        this.behaviorScoreService = behaviorScoreService;
        this.urgeService = urgeService;
        this.undoService = undoService;
        this.favorService = favorService;
        this.leakService = leakService;
    }

    public void handleAction(ClientAction action) {
        if (action instanceof JoinRoomAction a) {
            handleJoinRoom(a);
        } else if (action instanceof DrawTileAction a) {
            handleDrawTile(a);
        } else if (action instanceof DiscardTileAction a) {
            handleDiscardTile(a);
        } else if (action instanceof ClaimPongAction a) {
            handleClaimPong(a);
        } else if (action instanceof ClaimKongAction a) {
            handleClaimKong(a);
        } else if (action instanceof ClaimWinAction a) {
            handleClaimWin(a);
        } else if (action instanceof PassAction a) {
            handlePass(a);
        } else if (action instanceof UrgePlayerAction a) {
            handleUrgePlayer(a);
        } else if (action instanceof ShowHandAction a) {
            handleShowHand(a);
        } else if (action instanceof RequestUndoDiscardAction a) {
            handleRequestUndo(a);
        }
    }

    private void handleJoinRoom(JoinRoomAction action) {
        GameState state = games.computeIfAbsent(ROOM_ID, k -> new GameState(ROOM_ID, UUID.randomUUID().toString()));

        synchronized (state) {
            if (state.getPlayers().size() >= 3) {
                return;
            }

            PlayerState player = new PlayerState(
                    action.playerId(),
                    state.getPlayers().size(),
                    action.playerName() != null ? action.playerName() : "Player",
                    "human"
            );
            state.getPlayers().add(player);
            playerRooms.put(action.playerId(), ROOM_ID);

            publisher.publishToRoom(ROOM_ID, new PlayerJoinedEvent(ROOM_ID, state.getGameId(), action.playerId()));

            // Fill with bots
            String[] botNames = {"电脑A", "电脑B", "电脑C"};
            while (state.getPlayers().size() < 3) {
                int idx = state.getPlayers().size();
                String botId = "bot_" + idx;
                PlayerState bot = new PlayerState(botId, idx, botNames[idx], "bot");
                state.getPlayers().add(bot);
                publisher.publishToRoom(ROOM_ID, new BotFilledEvent(ROOM_ID, state.getGameId(), botId));
            }

            // Start game
            state.startGame();
            publishState(state);
        }
    }

    private void handleDrawTile(DrawTileAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState player = state.getPlayerById(action.playerId());
            if (player == null || player.getSeatId() != state.getCurrentTurnSeatId()) return;
            if (!"beforeDraw".equals(state.getNextPlayerStage())) return;

            Tile tile = state.drawTile();
            if (tile == null) return;

            if (action.advance()) {
                player.setAdvancedTile(tile);
                player.setHasPeekedAdvanced(false);
            } else {
                player.getHandTiles().add(tile);
            }

            state.setNextPlayerStage("inHand");
            publisher.publishToRoom(ROOM_ID, new TileDrawnEvent(ROOM_ID, state.getGameId(), player.getPlayerId(), tile.getId(), action.advance()));
            publishState(state);
        }
    }

    private void handleDiscardTile(DiscardTileAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState player = state.getPlayerById(action.playerId());
            if (player == null || player.getSeatId() != state.getCurrentTurnSeatId()) return;
            if (!"inHand".equals(state.getNextPlayerStage())) return;

            Tile tile = state.discardTile(player, action.tileId());
            if (tile == null) return;

            state.setLastDiscardedTile(tile);
            state.setLastDiscardedBy(player.getSeatId());
            state.setNextPlayerStage("discarded");

            publisher.publishToRoom(ROOM_ID, new TileDiscardedEvent(ROOM_ID, state.getGameId(), player.getPlayerId(), tile.getId()));
            publishState(state);
        }
    }

    private void handleClaimPong(ClaimPongAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState player = state.getPlayerById(action.playerId());
            if (player == null || state.getLastDiscardedTile() == null) return;

            if (!state.canPong(player)) return;

            state.executePong(player);
            publisher.publishToRoom(ROOM_ID, new PlayerJoinedEvent(ROOM_ID, state.getGameId(), player.getPlayerId()));
            publishState(state);
        }
    }

    private void handleClaimKong(ClaimKongAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState player = state.getPlayerById(action.playerId());
            if (player == null || state.getLastDiscardedTile() == null) return;

            if (!state.canKong(player)) return;

            state.executeKong(player);
            publishState(state);
        }
    }

    private void handleClaimWin(ClaimWinAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            state.setGameOver(true);
            state.setWinnerId(action.playerId());
            publisher.publishToRoom(ROOM_ID, new WinDeclaredEvent(ROOM_ID, state.getGameId(), action.playerId()));
            publishState(state);
        }
    }

    private void handlePass(PassAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            if ("discarded".equals(state.getNextPlayerStage())) {
                state.advanceTurn();
                publishState(state);
            }
        }
    }

    private void handleUrgePlayer(UrgePlayerAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState target = state.getPlayerById(action.targetPlayerId());
            if (target == null) return;

            target.setUrgeCount(target.getUrgeCount() + 1);
            int delta = urgeService.getUrgeDelta(target.getUrgeCount());
            target.setBehaviorScore(behaviorScoreService.applyDelta(target.getBehaviorScore(), delta));

            publisher.publishToRoom(ROOM_ID, new PlayerUrgedEvent(ROOM_ID, state.getGameId(), action.playerId(), action.targetPlayerId()));

            if (delta != 0) {
                publisher.publishToRoom(ROOM_ID, new BehaviorScoreChangedEvent(ROOM_ID, state.getGameId(), action.targetPlayerId(), delta, "URGE"));
            }

            publishState(state);
        }
    }

    private void handleShowHand(ShowHandAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState player = state.getPlayerById(action.playerId());
            if (player == null) return;

            player.setShowHand(true);
            publisher.publishToRoom(ROOM_ID, new HandShownEvent(ROOM_ID, state.getGameId(), action.playerId()));
            publishState(state);
        }
    }

    private void handleRequestUndo(RequestUndoDiscardAction action) {
        GameState state = games.get(ROOM_ID);
        if (state == null) return;

        synchronized (state) {
            PlayerState player = state.getPlayerById(action.playerId());
            if (player == null) return;

            player.setUndoCount(player.getUndoCount() + 1);
            Integer delta = undoService.getUndoDelta(player.getUndoCount(), UndoService.NextPlayerStage.valueOf(state.getNextPlayerStage().toUpperCase()));

            if (delta == null) return;

            player.setBehaviorScore(behaviorScoreService.applyDelta(player.getBehaviorScore(), delta));

            publisher.publishToRoom(ROOM_ID, new UndoRequestedEvent(ROOM_ID, state.getGameId(), action.playerId(), action.tileId()));
            publisher.publishToRoom(ROOM_ID, new BehaviorScoreChangedEvent(ROOM_ID, state.getGameId(), action.playerId(), delta, "REQUEST_UNDO"));

            // Auto-accept in this implementation
            state.undoDiscard(player, action.tileId());
            publisher.publishToRoom(ROOM_ID, new UndoAcceptedEvent(ROOM_ID, state.getGameId(), action.playerId(), action.tileId()));
            publishState(state);
        }
    }

    private void publishState(GameState state) {
        publisher.publishToRoom(ROOM_ID, state);
    }
}
