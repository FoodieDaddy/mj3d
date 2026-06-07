package com.kawuxing.websocket;

import com.kawuxing.game.action.ClientAction;
import com.kawuxing.game.core.GameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class GameSocketController {

    private final GameService gameService;

    public GameSocketController(GameService gameService) {
        this.gameService = gameService;
    }

    @MessageMapping("/game/action")
    public void handleAction(@Payload ClientAction action) {
        gameService.handleAction(action);
    }
}
