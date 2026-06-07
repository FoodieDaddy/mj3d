package com.kawuxing.game.event;

public record HandShownEvent(
        String roomId,
        String gameId,
        String playerId
) implements GameEvent {
}
