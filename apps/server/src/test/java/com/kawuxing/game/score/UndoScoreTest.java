package com.kawuxing.game.score;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class UndoScoreTest {

    private UndoService service;

    @BeforeEach
    void setUp() {
        service = new UndoService();
    }

    // --- Frequency delta tests ---

    @Test
    void frequency_1st_zero() {
        assertEquals(0, service.getUndoFrequencyDelta(1));
    }

    @Test
    void frequency_2nd_minus2() {
        assertEquals(-2, service.getUndoFrequencyDelta(2));
    }

    @Test
    void frequency_3rd_minus5() {
        assertEquals(-5, service.getUndoFrequencyDelta(3));
    }

    @Test
    void frequency_4th_minus9() {
        assertEquals(-9, service.getUndoFrequencyDelta(4));
    }

    @Test
    void frequency_5th_minus14() {
        assertEquals(-14, service.getUndoFrequencyDelta(5));
    }

    @Test
    void frequency_6th_minus14() {
        assertEquals(-14, service.getUndoFrequencyDelta(6));
    }

    // --- Progress delta tests ---

    @Test
    void progress_beforeDraw_zero() {
        assertEquals(0, service.getUndoProgressDelta(UndoService.NextPlayerStage.BEFORE_DRAW));
    }

    @Test
    void progress_drawing_minus2() {
        assertEquals(-2, service.getUndoProgressDelta(UndoService.NextPlayerStage.DRAWING));
    }

    @Test
    void progress_inHand_minus4() {
        assertEquals(-4, service.getUndoProgressDelta(UndoService.NextPlayerStage.IN_HAND));
    }

    @Test
    void progress_discarded_null() {
        assertNull(service.getUndoProgressDelta(UndoService.NextPlayerStage.DISCARDED));
    }

    // --- Total undo delta tests ---

    @Test
    void total_1st_beforeDraw_minus4() {
        assertEquals(-4, service.getUndoDelta(1, UndoService.NextPlayerStage.BEFORE_DRAW));
    }

    @Test
    void total_1st_drawing_minus6() {
        assertEquals(-6, service.getUndoDelta(1, UndoService.NextPlayerStage.DRAWING));
    }

    @Test
    void total_1st_inHand_minus8() {
        assertEquals(-8, service.getUndoDelta(1, UndoService.NextPlayerStage.IN_HAND));
    }

    @Test
    void total_2nd_beforeDraw_minus6() {
        assertEquals(-6, service.getUndoDelta(2, UndoService.NextPlayerStage.BEFORE_DRAW));
    }

    @Test
    void total_2nd_drawing_minus8() {
        assertEquals(-8, service.getUndoDelta(2, UndoService.NextPlayerStage.DRAWING));
    }

    @Test
    void total_3rd_inHand_minus13() {
        assertEquals(-13, service.getUndoDelta(3, UndoService.NextPlayerStage.IN_HAND));
    }

    @Test
    void total_5th_inHand_minus22() {
        assertEquals(-22, service.getUndoDelta(5, UndoService.NextPlayerStage.IN_HAND));
    }

    @Test
    void total_discarded_null() {
        assertNull(service.getUndoDelta(1, UndoService.NextPlayerStage.DISCARDED));
    }
}
