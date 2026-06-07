package com.kawuxing.game.score;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class UrgeScoreTest {

    private UrgeService service;

    @BeforeEach
    void setUp() {
        service = new UrgeService();
    }

    @Test
    void urge_1st_minus1() {
        assertEquals(-1, service.getUrgeDelta(1));
    }

    @Test
    void urge_2nd_zero() {
        assertEquals(0, service.getUrgeDelta(2));
    }

    @Test
    void urge_3rd_plus1() {
        assertEquals(1, service.getUrgeDelta(3));
    }

    @Test
    void urge_4th_plus2() {
        assertEquals(2, service.getUrgeDelta(4));
    }

    @Test
    void urge_5th_plus4() {
        assertEquals(4, service.getUrgeDelta(5));
    }

    @Test
    void urge_6th_plus6() {
        assertEquals(6, service.getUrgeDelta(6));
    }

    @Test
    void urge_7th_plus6() {
        assertEquals(6, service.getUrgeDelta(7));
    }

    @Test
    void urge_10th_plus6() {
        assertEquals(6, service.getUrgeDelta(10));
    }
}
