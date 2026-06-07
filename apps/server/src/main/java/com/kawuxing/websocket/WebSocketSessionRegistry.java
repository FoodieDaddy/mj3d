package com.kawuxing.websocket;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionRegistry {

    private final Map<String, String> playerToSession = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToPlayer = new ConcurrentHashMap<>();

    public void register(String playerId, String sessionId) {
        playerToSession.put(playerId, sessionId);
        sessionToPlayer.put(sessionId, playerId);
    }

    public void unregister(String sessionId) {
        String playerId = sessionToPlayer.remove(sessionId);
        if (playerId != null) {
            playerToSession.remove(playerId);
        }
    }

    public Optional<String> getSessionId(String playerId) {
        return Optional.ofNullable(playerToSession.get(playerId));
    }

    public Optional<String> getPlayerId(String sessionId) {
        return Optional.ofNullable(sessionToPlayer.get(sessionId));
    }
}
