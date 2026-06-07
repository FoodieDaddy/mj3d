# 来卡 - 前后端协议文档

## 消息基础结构

所有消息必须包含以下字段：

```json
{
  "protocolVersion": 1,
  "actionId": "uuid",
  "roomId": "main",
  "playerId": "guest_xxx",
  "type": "ACTION_TYPE",
  "payload": {}
}
```

## WebSocket 路径

| 方向 | 路径 | 说明 |
|------|------|------|
| 客户端 → 服务端 | `/app/game/action` | 发送 ClientAction |
| 服务端 → 客户端 | `/topic/room/{roomId}` | 房间事件广播 |
| 服务端 → 客户端 | `/user/queue/private` | 私密事件 |

连接地址：`ws://host:8080/ws`

---

## ClientAction 类型

### ROOM_JOIN - 加入房间

```json
{
  "type": "ROOM_JOIN",
  "payload": {
    "playerName": "玩家昵称（可选）"
  }
}
```

### DRAW_TILE - 摸牌

```json
{
  "type": "DRAW_TILE",
  "payload": {
    "advance": false
  }
}
```

- `advance: true` — 提前拿牌
- `advance: false` — 正常摸牌

### PEEK_ADVANCED_TILE - 查看提前拿的牌

```json
{
  "type": "PEEK_ADVANCED_TILE",
  "payload": {}
}
```

### PUT_TILE_IN_HAND - 放到手牌

```json
{
  "type": "PUT_TILE_IN_HAND",
  "payload": {
    "tileId": "tile_038"
  }
}
```

### DISCARD_TILE - 出牌

```json
{
  "type": "DISCARD_TILE",
  "payload": {
    "tileId": "tile_038"
  }
}
```

### REQUEST_UNDO_DISCARD - 请求撤回出牌

```json
{
  "type": "REQUEST_UNDO_DISCARD",
  "payload": {
    "tileId": "tile_038"
  }
}
```

### ALLOW_UNDO - 允许撤回

```json
{
  "type": "ALLOW_UNDO",
  "payload": {
    "targetPlayerId": "guest_xxx"
  }
}
```

### DENY_UNDO - 拒绝撤回

```json
{
  "type": "DENY_UNDO",
  "payload": {
    "targetPlayerId": "guest_xxx"
  }
}
```

### CLAIM_PONG - 碰牌

```json
{
  "type": "CLAIM_PONG",
  "payload": {
    "tileId": "tile_038"
  }
}
```

### CLAIM_KONG - 杠牌

```json
{
  "type": "CLAIM_KONG",
  "payload": {
    "tileId": "tile_038"
  }
}
```

### CLAIM_WIN - 胡牌

```json
{
  "type": "CLAIM_WIN",
  "payload": {
    "tileId": "tile_038"
  }
}
```

### PASS - 过

```json
{
  "type": "PASS",
  "payload": {}
}
```

### SHOW_HAND - 亮牌

```json
{
  "type": "SHOW_HAND",
  "payload": {}
}
```

### URGE_PLAYER - 催促

```json
{
  "type": "URGE_PLAYER",
  "payload": {
    "targetPlayerId": "guest_xxx"
  }
}
```

### QUESTION_TILE_SWAP - 质疑换牌

```json
{
  "type": "QUESTION_TILE_SWAP",
  "payload": {
    "targetPlayerId": "guest_xxx"
  }
}
```

### REQUIRE_ORIGINAL_RETURN - 要求退原牌

```json
{
  "type": "REQUIRE_ORIGINAL_RETURN",
  "payload": {
    "targetPlayerId": "guest_xxx"
  }
}
```

### TRY_SWAP_RETURN_TILE - 尝试换退牌

```json
{
  "type": "TRY_SWAP_RETURN_TILE",
  "payload": {
    "tileId": "tile_038"
  }
}
```

---

## GameEvent 类型

### PLAYER_JOINED - 玩家加入

```json
{
  "type": "PLAYER_JOINED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx"
}
```

### PLAYER_LEFT - 玩家离开

```json
{
  "type": "PLAYER_LEFT",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx"
}
```

### BOT_FILLED - AI 补位

```json
{
  "type": "BOT_FILLED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "bot_xxx"
}
```

### TILE_DRAWN - 摸牌

```json
{
  "type": "TILE_DRAWN",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038",
  "advanced": false
}
```

### ADVANCED_TILE_PEEKED - 提前拿牌已查看

```json
{
  "type": "ADVANCED_TILE_PEEKED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038"
}
```

### TILE_LEAKED - 漏牌

```json
{
  "type": "TILE_LEAKED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "viewerId": "guest_yyy",
  "tileId": "tile_038"
}
```

### TILE_PUT_IN_HAND - 牌放到手牌

```json
{
  "type": "TILE_PUT_IN_HAND",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038"
}
```

### TILE_DISCARDED - 出牌

```json
{
  "type": "TILE_DISCARDED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038"
}
```

### UNDO_REQUESTED - 请求撤回

```json
{
  "type": "UNDO_REQUESTED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038"
}
```

### UNDO_ACCEPTED - 撤回被接受

```json
{
  "type": "UNDO_ACCEPTED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038"
}
```

### UNDO_DENIED - 撤回被拒绝

```json
{
  "type": "UNDO_DENIED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "tileId": "tile_038"
}
```

### BEHAVIOR_SCORE_CHANGED - 行为分变化

```json
{
  "type": "BEHAVIOR_SCORE_CHANGED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "delta": -4,
  "reason": "REQUEST_UNDO"
}
```

### PLAYER_URGED - 被催促

```json
{
  "type": "PLAYER_URGED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx",
  "targetPlayerId": "guest_yyy"
}
```

### HAND_SHOWN - 亮牌

```json
{
  "type": "HAND_SHOWN",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx"
}
```

### WIN_DECLARED - 胡牌

```json
{
  "type": "WIN_DECLARED",
  "roomId": "main",
  "gameId": "game_xxx",
  "playerId": "guest_xxx"
}
```

---

## Redis Key 命名

| Key | 说明 |
|-----|------|
| `kwx:room:main:state` | 房间状态 |
| `kwx:room:main:queue` | 排队列表 |
| `kwx:player:{playerId}:session` | WebSocket session 映射 |
| `kwx:game:{gameId}:state` | 游戏状态快照 |
| `kwx:game:{gameId}:lock` | 分布式锁 |
| `kwx:action:{actionId}` | 防重复 action nonce |
