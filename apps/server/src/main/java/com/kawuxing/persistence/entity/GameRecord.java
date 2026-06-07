package com.kawuxing.persistence.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("game_record")
public class GameRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String gameId;
    private String roomId;
    private String winnerId;
    private Integer totalRounds;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getWinnerId() { return winnerId; }
    public void setWinnerId(String winnerId) { this.winnerId = winnerId; }
    public Integer getTotalRounds() { return totalRounds; }
    public void setTotalRounds(Integer totalRounds) { this.totalRounds = totalRounds; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}
