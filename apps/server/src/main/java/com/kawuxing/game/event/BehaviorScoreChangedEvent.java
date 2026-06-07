package com.kawuxing.game.event;

public record BehaviorScoreChangedEvent(
        String roomId,
        String gameId,
        String playerId,
        int delta,
        String reason
) implements GameEvent {
}
