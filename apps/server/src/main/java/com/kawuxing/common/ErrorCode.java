package com.kawuxing.common;

public record ErrorCode(int code, String message) {

    public static final ErrorCode ROOM_FULL = new ErrorCode(1001, "房间已满");
    public static final ErrorCode PLAYER_NOT_FOUND = new ErrorCode(1002, "玩家不存在");
    public static final ErrorCode INVALID_ACTION = new ErrorCode(1003, "无效操作");
    public static final ErrorCode GAME_NOT_FOUND = new ErrorCode(1004, "游戏不存在");
    public static final ErrorCode NOT_YOUR_TURN = new ErrorCode(1005, "不是你的回合");
}
