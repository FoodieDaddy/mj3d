package com.kawuxing.game.core;

public class Tile {

    private final String id;
    private final String suit;
    private final int value;

    public Tile(String id, String suit, int value) {
        this.id = id;
        this.suit = suit;
        this.value = value;
    }

    public String getId() { return id; }
    public String getSuit() { return suit; }
    public int getValue() { return value; }
}
