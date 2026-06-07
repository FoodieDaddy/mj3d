package com.kawuxing.game.score;

import org.springframework.stereotype.Service;

@Service
public class UrgeService {

    public int getUrgeDelta(int urgeCount) {
        if (urgeCount == 1) return -1;
        if (urgeCount == 2) return 0;
        if (urgeCount == 3) return 1;
        if (urgeCount == 4) return 2;
        if (urgeCount == 5) return 4;
        return 6;
    }
}
