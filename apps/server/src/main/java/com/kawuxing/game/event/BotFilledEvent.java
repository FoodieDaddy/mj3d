package com.kawuxing.game.event;

public record BotFilledEvent(
        String roomId,
        String gameId,
        String playerId
) implements GameEvent {
}
