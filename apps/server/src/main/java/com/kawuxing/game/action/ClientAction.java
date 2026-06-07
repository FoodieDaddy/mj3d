package com.kawuxing.game.action;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = JoinRoomAction.class, name = "ROOM_JOIN"),
    @JsonSubTypes.Type(value = DrawTileAction.class, name = "DRAW_TILE"),
    @JsonSubTypes.Type(value = PeekAdvancedTileAction.class, name = "PEEK_ADVANCED_TILE"),
    @JsonSubTypes.Type(value = PutTileInHandAction.class, name = "PUT_TILE_IN_HAND"),
    @JsonSubTypes.Type(value = DiscardTileAction.class, name = "DISCARD_TILE"),
    @JsonSubTypes.Type(value = RequestUndoDiscardAction.class, name = "REQUEST_UNDO_DISCARD"),
    @JsonSubTypes.Type(value = AllowUndoAction.class, name = "ALLOW_UNDO"),
    @JsonSubTypes.Type(value = DenyUndoAction.class, name = "DENY_UNDO"),
    @JsonSubTypes.Type(value = ClaimPongAction.class, name = "CLAIM_PONG"),
    @JsonSubTypes.Type(value = ClaimKongAction.class, name = "CLAIM_KONG"),
    @JsonSubTypes.Type(value = ClaimWinAction.class, name = "CLAIM_WIN"),
    @JsonSubTypes.Type(value = PassAction.class, name = "PASS"),
    @JsonSubTypes.Type(value = ShowHandAction.class, name = "SHOW_HAND"),
    @JsonSubTypes.Type(value = UrgePlayerAction.class, name = "URGE_PLAYER"),
    @JsonSubTypes.Type(value = QuestionTileSwapAction.class, name = "QUESTION_TILE_SWAP"),
    @JsonSubTypes.Type(value = RequireOriginalReturnAction.class, name = "REQUIRE_ORIGINAL_RETURN"),
    @JsonSubTypes.Type(value = TrySwapReturnTileAction.class, name = "TRY_SWAP_RETURN_TILE")
})
public sealed interface ClientAction permits
        JoinRoomAction,
        DrawTileAction,
        PeekAdvancedTileAction,
        PutTileInHandAction,
        DiscardTileAction,
        RequestUndoDiscardAction,
        AllowUndoAction,
        DenyUndoAction,
        ClaimPongAction,
        ClaimKongAction,
        ClaimWinAction,
        PassAction,
        ShowHandAction,
        UrgePlayerAction,
        QuestionTileSwapAction,
        RequireOriginalReturnAction,
        TrySwapReturnTileAction {
}
