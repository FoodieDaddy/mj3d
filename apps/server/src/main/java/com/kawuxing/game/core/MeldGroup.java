package com.kawuxing.game.core;

import java.util.List;

public class MeldGroup {

    private final String type;
    private final List<Tile> tiles;

    public MeldGroup(String type, List<Tile> tiles) {
        this.type = type;
        this.tiles = tiles;
    }

    public String getType() { return type; }
    public List<Tile> getTiles() { return tiles; }
}
