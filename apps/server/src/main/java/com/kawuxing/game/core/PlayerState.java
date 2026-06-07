package com.kawuxing.game.core;

import java.util.ArrayList;
import java.util.List;

public class PlayerState {

    private final String playerId;
    private final int seatId;
    private final String playerName;
    private final String playerType;
    private final List<Tile> handTiles = new ArrayList<>();
    private final List<Tile> discardedTiles = new ArrayList<>();
    private final List<MeldGroup> meldGroups = new ArrayList<>();
    private int behaviorScore = 50;
    private int urgeCount = 0;
    private int undoCount = 0;
    private boolean isShowHand = false;
    private Tile advancedTile;
    private boolean hasPeekedAdvanced = false;

    public PlayerState(String playerId, int seatId, String playerName, String playerType) {
        this.playerId = playerId;
        this.seatId = seatId;
        this.playerName = playerName;
        this.playerType = playerType;
    }

    // Getters and setters
    public String getPlayerId() { return playerId; }
    public int getSeatId() { return seatId; }
    public String getPlayerName() { return playerName; }
    public String getPlayerType() { return playerType; }
    public List<Tile> getHandTiles() { return handTiles; }
    public List<Tile> getDiscardedTiles() { return discardedTiles; }
    public List<MeldGroup> getMeldGroups() { return meldGroups; }
    public int getBehaviorScore() { return behaviorScore; }
    public void setBehaviorScore(int score) { this.behaviorScore = score; }
    public int getUrgeCount() { return urgeCount; }
    public void setUrgeCount(int count) { this.urgeCount = count; }
    public int getUndoCount() { return undoCount; }
    public void setUndoCount(int count) { this.undoCount = count; }
    public boolean isShowHand() { return isShowHand; }
    public void setShowHand(boolean show) { this.isShowHand = show; }
    public Tile getAdvancedTile() { return advancedTile; }
    public void setAdvancedTile(Tile tile) { this.advancedTile = tile; }
    public boolean isHasPeekedAdvanced() { return hasPeekedAdvanced; }
    public void setHasPeekedAdvanced(boolean peeked) { this.hasPeekedAdvanced = peeked; }
}
