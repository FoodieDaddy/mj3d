package com.kawuxing.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

public interface GameMessagePublisher {

    void publishToRoom(String roomId, Object message);

    void publishToPlayer(String playerId, Object message);
}
