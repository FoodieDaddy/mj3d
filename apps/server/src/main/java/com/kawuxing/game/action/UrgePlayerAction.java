package com.kawuxing.game.action;

public record UrgePlayerAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        String targetPlayerId
) implements ClientAction {
}
