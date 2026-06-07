package com.kawuxing.game.action;

public record PassAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId
) implements ClientAction {
}
