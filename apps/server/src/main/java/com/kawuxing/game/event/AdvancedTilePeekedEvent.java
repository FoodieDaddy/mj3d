package com.kawuxing.game.event;

public record AdvancedTilePeekedEvent(
        String roomId,
        String gameId,
        String playerId,
        String tileId
) implements GameEvent {
}
