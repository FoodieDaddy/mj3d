package com.kawuxing.game.score;

import org.springframework.stereotype.Service;

@Service
public class BehaviorScoreService {

    public static final int MIN = 0;
    public static final int MAX = 100;
    public static final int CENTER = 50;

    public int applyDelta(int current, int delta) {
        return Math.max(MIN, Math.min(MAX, current + delta));
    }
}
