package com.kawuxing.game.event;

public record UndoAcceptedEvent(
        String roomId,
        String gameId,
        String playerId,
        String tileId
) implements GameEvent {
}
