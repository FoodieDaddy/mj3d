package com.kawuxing.game.action;

public record ShowHandAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId
) implements ClientAction {
}
