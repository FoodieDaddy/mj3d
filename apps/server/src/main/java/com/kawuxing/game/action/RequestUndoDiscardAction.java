package com.kawuxing.game.action;

public record RequestUndoDiscardAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        String tileId
) implements ClientAction {
}
