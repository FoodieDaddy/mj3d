package com.kawuxing.game.event;

public record PlayerUrgedEvent(
        String roomId,
        String gameId,
        String playerId,
        String targetPlayerId
) implements GameEvent {
}
