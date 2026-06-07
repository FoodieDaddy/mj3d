package com.kawuxing.game.action;

public record PeekAdvancedTileAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId
) implements ClientAction {
}
