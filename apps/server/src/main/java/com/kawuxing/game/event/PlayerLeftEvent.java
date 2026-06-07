package com.kawuxing.game.event;

public record PlayerLeftEvent(
        String roomId,
        String gameId,
        String playerId
) implements GameEvent {
}
