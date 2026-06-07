package com.kawuxing.game.core;

import java.util.*;

public class GameState {

    private final String roomId;
    private final String gameId;
    private final List<PlayerState> players = new ArrayList<>();
    private final List<Tile> wallTiles = new ArrayList<>();
    private int currentTurnSeatId = 0;
    private String nextPlayerStage = "beforeDraw";
    private Tile lastDiscardedTile;
    private Integer lastDiscardedBy;
    private boolean isGameOver = false;
    private String winnerId;

    public GameState(String roomId, String gameId) {
        this.roomId = roomId;
        this.gameId = gameId;
    }

    public void startGame() {
        List<Tile> allTiles = createTileSet();
        Collections.shuffle(allTiles);

        for (int i = 0; i < 3; i++) {
            players.get(i).getHandTiles().addAll(allTiles.subList(i * 13, (i + 1) * 13));
        }

        wallTiles.addAll(allTiles.subList(39, allTiles.size()));
        currentTurnSeatId = 0;
        nextPlayerStage = "beforeDraw";
    }

    public Tile drawTile() {
        if (wallTiles.isEmpty()) return null;
        return wallTiles.remove(0);
    }

    public Tile discardTile(PlayerState player, String tileId) {
        Tile tile = player.getHandTiles().stream()
                .filter(t -> t.getId().equals(tileId))
                .findFirst()
                .orElse(null);
        if (tile == null) return null;

        player.getHandTiles().remove(tile);
        player.getDiscardedTiles().add(tile);
        return tile;
    }

    public void advanceTurn() {
        currentTurnSeatId = (currentTurnSeatId + 1) % 3;
        nextPlayerStage = "beforeDraw";
    }

    public boolean canPong(PlayerState player) {
        if (lastDiscardedTile == null) return false;
        long count = player.getHandTiles().stream()
                .filter(t -> t.getSuit().equals(lastDiscardedTile.getSuit()) && t.getValue() == lastDiscardedTile.getValue())
                .count();
        return count >= 2;
    }

    public boolean canKong(PlayerState player) {
        if (lastDiscardedTile == null) return false;
        long count = player.getHandTiles().stream()
                .filter(t -> t.getSuit().equals(lastDiscardedTile.getSuit()) && t.getValue() == lastDiscardedTile.getValue())
                .count();
        return count >= 3;
    }

    public void executePong(PlayerState player) {
        List<Tile> matching = player.getHandTiles().stream()
                .filter(t -> t.getSuit().equals(lastDiscardedTile.getSuit()) && t.getValue() == lastDiscardedTile.getValue())
                .limit(2)
                .toList();

        player.getHandTiles().removeAll(matching);
        List<Tile> meld = new ArrayList<>(matching);
        meld.add(lastDiscardedTile);
        player.getMeldGroups().add(new MeldGroup("pong", meld));

        currentTurnSeatId = player.getSeatId();
        nextPlayerStage = "inHand";
        lastDiscardedTile = null;
    }

    public void executeKong(PlayerState player) {
        List<Tile> matching = player.getHandTiles().stream()
                .filter(t -> t.getSuit().equals(lastDiscardedTile.getSuit()) && t.getValue() == lastDiscardedTile.getValue())
                .limit(3)
                .toList();

        player.getHandTiles().removeAll(matching);
        List<Tile> meld = new ArrayList<>(matching);
        meld.add(lastDiscardedTile);
        player.getMeldGroups().add(new MeldGroup("kong", meld));

        currentTurnSeatId = player.getSeatId();
        nextPlayerStage = "beforeDraw";
        lastDiscardedTile = null;
    }

    public void undoDiscard(PlayerState player, String tileId) {
        Tile tile = player.getDiscardedTiles().stream()
                .filter(t -> t.getId().equals(tileId))
                .findFirst()
                .orElse(null);
        if (tile == null) return;

        player.getDiscardedTiles().remove(tile);
        player.getHandTiles().add(tile);
    }

    public PlayerState getPlayerById(String playerId) {
        return players.stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElse(null);
    }

    private List<Tile> createTileSet() {
        List<Tile> tiles = new ArrayList<>();
        String[] suits = {"wan", "tiao", "tong"};
        int id = 0;
        for (String suit : suits) {
            for (int value = 1; value <= 9; value++) {
                for (int copy = 0; copy < 4; copy++) {
                    tiles.add(new Tile(String.format("tile_%03d", id), suit, value));
                    id++;
                }
            }
        }
        return tiles;
    }

    // Getters and setters
    public String getRoomId() { return roomId; }
    public String getGameId() { return gameId; }
    public List<PlayerState> getPlayers() { return players; }
    public List<Tile> getWallTiles() { return wallTiles; }
    public int getCurrentTurnSeatId() { return currentTurnSeatId; }
    public void setCurrentTurnSeatId(int id) { this.currentTurnSeatId = id; }
    public String getNextPlayerStage() { return nextPlayerStage; }
    public void setNextPlayerStage(String stage) { this.nextPlayerStage = stage; }
    public Tile getLastDiscardedTile() { return lastDiscardedTile; }
    public void setLastDiscardedTile(Tile tile) { this.lastDiscardedTile = tile; }
    public Integer getLastDiscardedBy() { return lastDiscardedBy; }
    public void setLastDiscardedBy(Integer seatId) { this.lastDiscardedBy = seatId; }
    public boolean isGameOver() { return isGameOver; }
    public void setGameOver(boolean gameOver) { isGameOver = gameOver; }
    public String getWinnerId() { return winnerId; }
    public void setWinnerId(String id) { this.winnerId = id; }
}
