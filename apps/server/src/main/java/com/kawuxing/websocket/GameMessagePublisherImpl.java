package com.kawuxing.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class GameMessagePublisherImpl implements GameMessagePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public GameMessagePublisherImpl(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publishToRoom(String roomId, Object message) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }

    @Override
    public void publishToPlayer(String playerId, Object message) {
        messagingTemplate.convertAndSendToUser(playerId, "/queue/private", message);
    }
}
