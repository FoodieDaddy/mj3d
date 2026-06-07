package com.kawuxing.game.action;

public record DrawTileAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        boolean advance
) implements ClientAction {
}
