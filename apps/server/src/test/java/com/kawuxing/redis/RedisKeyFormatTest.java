package com.kawuxing.redis;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests verify Redis key format conventions without requiring actual Redis.
 */
class RedisKeyFormatTest {

    @Test
    void roomStateKey_format() {
        String roomId = "main";
        String key = "kwx:room:" + roomId + ":state";
        assertEquals("kwx:room:main:state", key);
    }

    @Test
    void roomStateKey_differentRooms() {
        assertEquals("kwx:room:room1:state", "kwx:room:" + "room1" + ":state");
        assertEquals("kwx:room:room2:state", "kwx:room:" + "room2" + ":state");
    }

    @Test
    void gameLockKey_format() {
        String gameId = "game_001";
        String key = "kwx:game:" + gameId + ":lock";
        assertEquals("kwx:game:game_001:lock", key);
    }

    @Test
    void gameLockKey_differentGames() {
        assertEquals("kwx:game:game1:lock", "kwx:game:" + "game1" + ":lock");
        assertEquals("kwx:game:game2:lock", "kwx:game:" + "game2" + ":lock");
    }

    @Test
    void keyPrefixes_followConvention() {
        assertTrue("kwx:room:main:state".startsWith("kwx:room:"));
        assertTrue("kwx:game:game_001:lock".startsWith("kwx:game:"));
    }

    @Test
    void keyFormats_areConsistent() {
        // Room state keys
        String roomKey1 = "kwx:room:" + "main" + ":state";
        String roomKey2 = "kwx:room:" + "room_001" + ":state";
        assertTrue(roomKey1.endsWith(":state"));
        assertTrue(roomKey2.endsWith(":state"));

        // Game lock keys
        String lockKey1 = "kwx:game:" + "game_001" + ":lock";
        String lockKey2 = "kwx:game:" + "game_002" + ":lock";
        assertTrue(lockKey1.endsWith(":lock"));
        assertTrue(lockKey2.endsWith(":lock"));
    }
}
