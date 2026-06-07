package com.kawuxing.game.score;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class FavorWeightTest {

    private FavorService service;

    @BeforeEach
    void setUp() {
        service = new FavorService();
    }

    @Test
    void score50_weight100() {
        assertEquals(100, service.getFavorWeight(50));
    }

    @Test
    void score40_weight80() {
        assertEquals(80, service.getFavorWeight(40));
    }

    @Test
    void score60_weight80() {
        assertEquals(80, service.getFavorWeight(60));
    }

    @Test
    void score25_weight50() {
        assertEquals(50, service.getFavorWeight(25));
    }

    @Test
    void score75_weight50() {
        assertEquals(50, service.getFavorWeight(75));
    }

    @Test
    void score0_weight5() {
        assertEquals(5, service.getFavorWeight(0));
    }

    @Test
    void score100_weight5() {
        assertEquals(5, service.getFavorWeight(100));
    }

    @Test
    void weight_neverBelow5() {
        assertTrue(service.getFavorWeight(0) >= 5);
        assertTrue(service.getFavorWeight(100) >= 5);
    }

    @Test
    void closerToCenter_higherWeight() {
        assertTrue(service.getFavorWeight(50) > service.getFavorWeight(40));
        assertTrue(service.getFavorWeight(40) > service.getFavorWeight(25));
        assertTrue(service.getFavorWeight(25) > service.getFavorWeight(0));
    }

    @Test
    void symmetricAroundCenter() {
        assertEquals(service.getFavorWeight(40), service.getFavorWeight(60));
        assertEquals(service.getFavorWeight(25), service.getFavorWeight(75));
        assertEquals(service.getFavorWeight(10), service.getFavorWeight(90));
    }
}
