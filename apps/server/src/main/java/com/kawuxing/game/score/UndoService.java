package com.kawuxing.game.score;

import org.springframework.stereotype.Service;

@Service
public class UndoService {

    public enum NextPlayerStage {
        BEFORE_DRAW, DRAWING, IN_HAND, DISCARDED
    }

    public int getUndoFrequencyDelta(int undoCount) {
        if (undoCount <= 1) return 0;
        if (undoCount == 2) return -2;
        if (undoCount == 3) return -5;
        if (undoCount == 4) return -9;
        return -14;
    }

    public Integer getUndoProgressDelta(NextPlayerStage stage) {
        return switch (stage) {
            case BEFORE_DRAW -> 0;
            case DRAWING -> -2;
            case IN_HAND -> -4;
            case DISCARDED -> null;
        };
    }

    public Integer getUndoDelta(int undoCount, NextPlayerStage stage) {
        int base = -4;
        Integer progressDelta = getUndoProgressDelta(stage);

        if (progressDelta == null) {
            return null;
        }

        return base + getUndoFrequencyDelta(undoCount) + progressDelta;
    }
}
