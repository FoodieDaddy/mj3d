package com.kawuxing.game.action;

public record JoinRoomAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        String playerName
) implements ClientAction {
}
