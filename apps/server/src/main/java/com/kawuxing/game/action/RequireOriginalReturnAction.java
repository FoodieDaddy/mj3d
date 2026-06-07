package com.kawuxing.game.action;

public record RequireOriginalReturnAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        String targetPlayerId
) implements ClientAction {
}
