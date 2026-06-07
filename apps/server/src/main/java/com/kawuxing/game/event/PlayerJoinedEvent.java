package com.kawuxing.game.event;

public record PlayerJoinedEvent(
        String roomId,
        String gameId,
        String playerId
) implements GameEvent {
}
