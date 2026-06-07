package com.kawuxing.game.event;

public record UndoRequestedEvent(
        String roomId,
        String gameId,
        String playerId,
        String tileId
) implements GameEvent {
}
