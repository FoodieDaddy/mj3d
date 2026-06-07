package com.kawuxing.game.event;

public record TileLeakedEvent(
        String roomId,
        String gameId,
        String playerId,
        String viewerId,
        String tileId
) implements GameEvent {
}
