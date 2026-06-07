package com.kawuxing.persistence;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kawuxing.persistence.entity.GameRecord;
import com.kawuxing.persistence.entity.PlayerGuest;
import com.kawuxing.persistence.mapper.GameRecordMapper;
import com.kawuxing.persistence.mapper.PlayerGuestMapper;
import org.apache.ibatis.annotations.Mapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MapperSmokeTest {

    @Test
    void playerGuestMapper_isInterface() {
        assertTrue(PlayerGuestMapper.class.isInterface());
    }

    @Test
    void playerGuestMapper_extendsBaseMapper() {
        assertTrue(BaseMapper.class.isAssignableFrom(PlayerGuestMapper.class));
    }

    @Test
    void playerGuestMapper_hasMapperAnnotation() {
        assertNotNull(PlayerGuestMapper.class.getAnnotation(Mapper.class));
    }

    @Test
    void gameRecordMapper_isInterface() {
        assertTrue(GameRecordMapper.class.isInterface());
    }

    @Test
    void gameRecordMapper_extendsBaseMapper() {
        assertTrue(BaseMapper.class.isAssignableFrom(GameRecordMapper.class));
    }

    @Test
    void gameRecordMapper_hasMapperAnnotation() {
        assertNotNull(GameRecordMapper.class.getAnnotation(Mapper.class));
    }

    @Test
    void playerGuestEntity_hasIdField() throws NoSuchFieldException {
        assertNotNull(PlayerGuest.class.getDeclaredField("id"));
    }

    @Test
    void playerGuestEntity_hasGuestIdField() throws NoSuchFieldException {
        assertNotNull(PlayerGuest.class.getDeclaredField("guestId"));
    }

    @Test
    void gameRecordEntity_hasIdField() throws NoSuchFieldException {
        assertNotNull(GameRecord.class.getDeclaredField("id"));
    }

    @Test
    void gameRecordEntity_hasGameIdField() throws NoSuchFieldException {
        assertNotNull(GameRecord.class.getDeclaredField("gameId"));
    }
}
