package com.kawuxing.game.event;

public record WinDeclaredEvent(
        String roomId,
        String gameId,
        String playerId
) implements GameEvent {
}
