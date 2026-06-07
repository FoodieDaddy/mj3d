package com.kawuxing.game.event;

public sealed interface GameEvent permits
        PlayerJoinedEvent,
        PlayerLeftEvent,
        BotFilledEvent,
        TileDrawnEvent,
        AdvancedTilePeekedEvent,
        TileLeakedEvent,
        TilePutInHandEvent,
        TileDiscardedEvent,
        UndoRequestedEvent,
        UndoAcceptedEvent,
        UndoDeniedEvent,
        BehaviorScoreChangedEvent,
        PlayerUrgedEvent,
        HandShownEvent,
        WinDeclaredEvent {
}
