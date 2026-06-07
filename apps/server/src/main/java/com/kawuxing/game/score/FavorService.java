package com.kawuxing.game.score;

import org.springframework.stereotype.Service;

@Service
public class FavorService {

    public int getFavorWeight(int behaviorScore) {
        int distance = Math.abs(behaviorScore - BehaviorScoreService.CENTER);
        return Math.max(5, 100 - distance * 2);
    }

    public boolean isFavored(int behaviorScore) {
        int weight = getFavorWeight(behaviorScore);
        return Math.random() * 100 < weight;
    }
}
