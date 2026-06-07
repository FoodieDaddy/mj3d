package com.kawuxing.game.score;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class BehaviorScoreTest {

    private BehaviorScoreService service;

    @BeforeEach
    void setUp() {
        service = new BehaviorScoreService();
    }

    @Test
    void applyDelta_positiveDelta() {
        assertEquals(56, service.applyDelta(50, 6));
    }

    @Test
    void applyDelta_negativeDelta() {
        assertEquals(46, service.applyDelta(50, -4));
    }

    @Test
    void applyDelta_clampToMin() {
        assertEquals(0, service.applyDelta(2, -10));
    }

    @Test
    void applyDelta_clampToMax() {
        assertEquals(100, service.applyDelta(98, 10));
    }

    @Test
    void applyDelta_zeroDelta() {
        assertEquals(50, service.applyDelta(50, 0));
    }

    @Test
    void applyDelta_questionTileSwap_plus6() {
        assertEquals(56, service.applyDelta(50, 6));
    }

    @Test
    void applyDelta_denySlowPong_plus4() {
        assertEquals(54, service.applyDelta(50, 4));
    }

    @Test
    void applyDelta_denyUndo_plus4() {
        assertEquals(54, service.applyDelta(50, 4));
    }

    @Test
    void applyDelta_requireOriginalReturn_plus10() {
        assertEquals(60, service.applyDelta(50, 10));
    }

    @Test
    void applyDelta_advanceDraw_zero() {
        assertEquals(50, service.applyDelta(50, 0));
    }

    @Test
    void applyDelta_advancePeekLook_minus2() {
        assertEquals(48, service.applyDelta(50, -2));
    }

    @Test
    void applyDelta_trySwap_minus5() {
        assertEquals(45, service.applyDelta(50, -5));
    }

    @Test
    void applyDelta_swapCaughtExtra_minus5() {
        assertEquals(45, service.applyDelta(50, -5));
    }

    @Test
    void applyDelta_requestUndo_minus4() {
        assertEquals(46, service.applyDelta(50, -4));
    }

    @Test
    void applyDelta_neverBelowZero() {
        assertEquals(0, service.applyDelta(0, -100));
    }

    @Test
    void applyDelta_neverAbove100() {
        assertEquals(100, service.applyDelta(100, 100));
    }

    @Test
    void applyDelta_multipleChanges_clampedToRange() {
        int score = 50;
        score = service.applyDelta(score, -30); // 20
        score = service.applyDelta(score, -30); // 0 (clamped)
        score = service.applyDelta(score, -10); // still 0
        assertEquals(0, score);

        score = 50;
        score = service.applyDelta(score, 30); // 80
        score = service.applyDelta(score, 30); // 100 (clamped)
        score = service.applyDelta(score, 10); // still 100
        assertEquals(100, score);
    }
}
