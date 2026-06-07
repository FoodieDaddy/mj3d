package com.kawuxing.game.event;

public record UndoDeniedEvent(
        String roomId,
        String gameId,
        String playerId,
        String tileId
) implements GameEvent {
}
