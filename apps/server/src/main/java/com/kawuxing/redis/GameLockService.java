package com.kawuxing.redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class GameLockService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String KEY_PREFIX = "kwx:game:";
    private static final String LOCK_SUFFIX = ":lock";
    private static final long LOCK_TIMEOUT_MS = 5000;

    public GameLockService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean tryLock(String gameId) {
        String key = KEY_PREFIX + gameId + LOCK_SUFFIX;
        Boolean result = redisTemplate.opsForValue().setIfAbsent(key, "1", LOCK_TIMEOUT_MS, TimeUnit.MILLISECONDS);
        return Boolean.TRUE.equals(result);
    }

    public void unlock(String gameId) {
        String key = KEY_PREFIX + gameId + LOCK_SUFFIX;
        redisTemplate.delete(key);
    }
}
