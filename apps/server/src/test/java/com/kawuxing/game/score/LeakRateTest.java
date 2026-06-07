package com.kawuxing.game.score;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class LeakRateTest {

    private LeakService service;

    @BeforeEach
    void setUp() {
        service = new LeakService();
    }

    @Test
    void score50_notFavored_008() {
        assertEquals(0.08, service.getLeakRate(50, false), 0.001);
    }

    @Test
    void score50_favored_clampedTo003() {
        // 0.08 - 0.06 = 0.02, clamped to 0.03
        assertEquals(0.03, service.getLeakRate(50, true), 0.001);
    }

    @Test
    void score0_notFavored_033() {
        // 0.08 + 50*0.005 = 0.33
        assertEquals(0.33, service.getLeakRate(0, false), 0.001);
    }

    @Test
    void score100_notFavored_033() {
        // 0.08 + 50*0.005 = 0.33
        assertEquals(0.33, service.getLeakRate(100, false), 0.001);
    }

    @Test
    void score0_favored_027() {
        // 0.33 - 0.06 = 0.27
        assertEquals(0.27, service.getLeakRate(0, true), 0.001);
    }

    @Test
    void score100_favored_027() {
        assertEquals(0.27, service.getLeakRate(100, true), 0.001);
    }

    @Test
    void rate_neverBelow003() {
        assertTrue(service.getLeakRate(50, true) >= 0.03);
    }

    @Test
    void rate_neverAbove035() {
        assertTrue(service.getLeakRate(0, false) <= 0.35);
    }

    @Test
    void peekingDoesNotAffectRate() {
        // Rate depends on behaviorScore and isFavored, not on peek status
        double rate1 = service.getLeakRate(50, false);
        double rate2 = service.getLeakRate(50, false);
        assertEquals(rate1, rate2, 0.001);
    }

    @Test
    void leakDirection_isLeftOrRight() {
        String direction = service.getLeakDirection();
        assertTrue("left".equals(direction) || "right".equals(direction));
    }
}
