package com.kawuxing.game.event;

public record TileDrawnEvent(
        String roomId,
        String gameId,
        String playerId,
        String tileId,
        boolean advanced
) implements GameEvent {
}
