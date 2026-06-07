package com.kawuxing.game.score;

import org.springframework.stereotype.Service;

@Service
public class LeakService {

    public double getLeakRate(int behaviorScore, boolean isFavored) {
        int distance = Math.abs(behaviorScore - BehaviorScoreService.CENTER);

        double rate = 0.08 + distance * 0.005;

        if (isFavored) {
            rate -= 0.06;
        }

        return Math.max(0.03, Math.min(rate, 0.35));
    }

    public String getLeakDirection() {
        return Math.random() < 0.5 ? "left" : "right";
    }
}
