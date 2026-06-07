package com.kawuxing.game.action;

public record ClaimPongAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        String tileId
) implements ClientAction {
}
