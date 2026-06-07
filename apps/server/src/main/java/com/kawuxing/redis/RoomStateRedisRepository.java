package com.kawuxing.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
public class RoomStateRedisRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String KEY_PREFIX = "kwx:room:";
    private static final String STATE_SUFFIX = ":state";
    private static final long TTL_HOURS = 24;

    public RoomStateRedisRepository(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void saveState(String roomId, Object state) {
        String key = KEY_PREFIX + roomId + STATE_SUFFIX;
        redisTemplate.opsForValue().set(key, state, TTL_HOURS, TimeUnit.HOURS);
    }

    @SuppressWarnings("unchecked")
    public <T> T getState(String roomId, Class<T> clazz) {
        String key = KEY_PREFIX + roomId + STATE_SUFFIX;
        Object state = redisTemplate.opsForValue().get(key);
        if (state == null) return null;
        return objectMapper.convertValue(state, clazz);
    }

    public void deleteState(String roomId) {
        String key = KEY_PREFIX + roomId + STATE_SUFFIX;
        redisTemplate.delete(key);
    }
}
