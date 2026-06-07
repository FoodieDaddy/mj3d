package com.kawuxing.game.event;

public record TileDiscardedEvent(
        String roomId,
        String gameId,
        String playerId,
        String tileId
) implements GameEvent {
}
