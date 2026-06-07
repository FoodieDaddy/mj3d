# 来卡 (kawuxing) 项目说明文档

> 最后更新：2026-06-07

---

## 一、项目概览

来卡是一个手机浏览器优先的 3D 武汉卡五星游戏。核心特色是"活桌动作系统"——提前拿牌、漏牌、撤回、催促、亮牌等社交化玩法。

**技术栈：**
- 前端：Vue 3 + TypeScript + Three.js (TresJS) + Pinia + Vite
- 后端：JDK 21 + Spring Boot + Spring WebSocket (STOMP) + MySQL 8 + Redis + 阿里云 OSS
- 构建：pnpm monorepo 工作区

**工程结构：**
```
kawuxing/
├── apps/web/          # Vue 3 前端应用
├── apps/server/       # Spring Boot 后端
├── packages/protocol/ # 前后端共享协议类型
├── packages/web-core/ # 前端单机核心逻辑
├── packages/shared/   # 公共工具函数
└── docs/              # 设计文档
```

---

## 二、数据结构

### 2.1 牌 (Tile)

```ts
interface Tile {
  id: string              // "tile_000" ~ "tile_107"
  suit: 'wan' | 'tiao' | 'tong'  // 万/条/筒
  value: number           // 1-9
}
```

共 108 张牌：3 花色 × 9 点数 × 4 张。

### 2.2 玩家状态 (PlayerState)

```ts
interface PlayerState {
  playerId: string
  seatId: SeatId          // 0 | 1 | 2
  playerName: string
  playerType: 'human' | 'bot'
  botStyle?: 'normal' | 'fast' | 'loose' | 'strict'
  handTiles: Tile[]       // 手牌（13张 + 摸牌）
  discardedTiles: Tile[]  // 弃牌
  meldGroups: MeldGroup[] // 碰/杠组
  behaviorScore: number   // 行为分 0-100，初始 50
  urgeCount: number       // 本局被催促次数
  undoCount: number       // 本局撤回次数
  isShowHand: boolean     // 是否亮牌
  advancedTile: Tile | null    // 提前拿的牌
  hasPeekedAdvanced: boolean   // 是否偷看过提前牌
}
```

### 2.3 碰/杠组 (MeldGroup)

```ts
interface MeldGroup {
  type: 'pong' | 'kong' | 'chow'
  tiles: Tile[]
}
```

### 2.4 响应窗口 (ResponseWindow)

```ts
interface ResponseWindow {
  discardTileId: string
  discardTileValue: string
  discardTileSuit: 'wan' | 'tiao' | 'tong'
  discardPlayerId: string
  eligiblePlayerIds: string[]       // 可碰/胡的玩家
  deadlineAt: number                // 截止时间戳
  responses: Record<string, 'PONG' | 'PASS' | null>
}
```

### 2.5 游戏状态 (GameState)

```ts
interface GameState {
  roomId: string
  gameId: string
  players: PlayerState[3]           // 固定 3 人
  wallTiles: Tile[]                 // 牌墙
  currentTurnSeatId: SeatId         // 当前回合座位
  nextPlayerStage: NextPlayerStage  // 下一动作阶段
  lastDiscardedTile: Tile | null    // 最后打出的牌
  lastDiscardedBy: SeatId | null    // 谁打的
  responseWindow: ResponseWindow | null
  isGameOver: boolean
  winnerId: string | null
}
```

### 2.6 回合阶段 (NextPlayerStage)

```
beforeDraw → drawing → inHand → discarded → responseWindow → (循环)
```

| 阶段 | 含义 |
|------|------|
| `beforeDraw` | 可以摸牌 |
| `drawing` | 正在摸牌（过渡态） |
| `inHand` | 手中有牌，可以出牌或操作提前牌 |
| `discarded` | 刚出完牌（旧版，保留兼容） |
| `responseWindow` | 等待其他玩家碰/胡响应 |

---

## 三、协议系统 (packages/protocol)

前后端通过统一协议通信，所有消息带基础字段：

```ts
{
  protocolVersion: 1,
  actionId: string,    // UUID
  roomId: string,
  playerId: string,
  type: string,
  payload: object
}
```

### 3.1 客户端动作 (ClientAction) — 17 种

| 动作类型 | Payload | 说明 |
|---------|---------|------|
| `ROOM_JOIN` | `playerName?` | 加入房间 |
| `DRAW_TILE` | `advance: boolean` | 摸牌，advance=true 为提前拿牌 |
| `PEEK_ADVANCED_TILE` | `{}` | 偷看提前牌 |
| `PUT_TILE_IN_HAND` | `tileId` | 将提前牌放入手牌 |
| `DISCARD_TILE` | `tileId` | 出牌 |
| `REQUEST_UNDO_DISCARD` | `tileId` | 请求撤回出牌 |
| `ALLOW_UNDO` | `targetPlayerId` | 允许撤回 |
| `DENY_UNDO` | `targetPlayerId` | 拒绝撤回 |
| `CLAIM_PONG` | `tileId` | 碰牌 |
| `CLAIM_KONG` | `tileId` | 杠牌 |
| `CLAIM_WIN` | `tileId?` | 胡牌 |
| `PASS` | `{}` | 过（不碰/不胡） |
| `SHOW_HAND` | `{}` | 亮牌 |
| `URGE_PLAYER` | `targetPlayerId` | 催促某玩家 |
| `QUESTION_TILE_SWAP` | `targetPlayerId` | 质疑换牌（未实现） |
| `REQUIRE_ORIGINAL_RETURN` | `targetPlayerId` | 要求退原牌（未实现） |
| `TRY_SWAP_RETURN_TILE` | `tileId` | 尝试换牌（未实现） |

### 3.2 服务端事件 (GameEvent) — 17 种

| 事件类型 | 关键字段 | 说明 |
|---------|---------|------|
| `PLAYER_JOINED` | playerId | 玩家加入 |
| `PLAYER_LEFT` | playerId | 玩家离开 |
| `BOT_FILLED` | playerId | AI 补位 |
| `TILE_DRAWN` | playerId, tileId, advanced | 摸牌 |
| `ADVANCED_TILE_PEEKED` | playerId, tileId | 偷看提前牌 |
| `TILE_LEAKED` | playerId, viewerId, tileId | 漏牌（被邻居看到） |
| `TILE_PUT_IN_HAND` | playerId, tileId | 提前牌放入手牌 |
| `TILE_DISCARDED` | playerId, tileId | 出牌 |
| `UNDO_REQUESTED` | playerId, tileId | 请求撤回 |
| `UNDO_ACCEPTED` | playerId, tileId | 撤回成功 |
| `UNDO_DENIED` | playerId, tileId | 撤回被拒 |
| `BEHAVIOR_SCORE_CHANGED` | playerId, delta, reason | 行为分变化 |
| `PLAYER_URGED` | playerId, targetPlayerId | 被催促 |
| `HAND_SHOWN` | playerId | 亮牌 |
| `WIN_DECLARED` | playerId | 胡牌 |
| `RESPONSE_WINDOW_OPENED` | discardTileId, discardPlayerId, eligiblePlayerIds | 碰牌窗口开启 |
| `RESPONSE_WINDOW_CLOSED` | pongPlayerId (nullable) | 碰牌窗口关闭 |

### 3.3 传输层接口 (GameTransport)

```ts
interface GameTransport {
  send(action: ClientAction): void
  onState(callback: (state: GameState) => void): void
  onEvent(callback: (event: GameEvent) => void): void
  disconnect(): void
}
```

两种实现：
- **LocalTransport** — 单机模式，进程内调用 LocalMockServer
- **SocketTransport** — 联机模式，STOMP WebSocket 连接后端

---

## 四、核心游戏逻辑 (packages/web-core)

### 4.1 游戏状态机 (game-state-manager.ts)

纯函数设计，不依赖任何外部状态。关键函数：

| 函数 | 作用 |
|------|------|
| `createGameState(roomId, gameId)` | 创建空游戏状态 |
| `addPlayer(state, playerId, name, type, botStyle?)` | 添加玩家（最多 3 人） |
| `startGame(state, seed?)` | 生成 108 张牌、洗牌、每人发 13 张 |
| `drawTile(state, seatId)` | 从牌墙摸一张牌 |
| `discardTile(state, seatId, tileId)` | 从手牌移除并放入弃牌区 |
| `putTileInHand(state, seatId, tile)` | 将提前牌放入手牌 |
| `advanceTurn(state)` | 轮转到下一位玩家 |
| `canPong(state, playerId, tileId)` | 判断能否碰（手牌有 2 张相同） |
| `canKong(state, playerId, tileId)` | 判断能否杠（手牌有 3 张相同） |
| `applyUrge(state, targetPlayerId)` | 应用催促行为分变化 |
| `applyUndoRequest(state, playerId)` | 应用撤回行为分变化 |
| `openResponseWindow(state, durationMs)` | 开启碰牌响应窗口 |
| `resolveResponseWindow(state)` | 处理碰牌响应结果 |
| `checkLeak(state, playerId, tileId)` | 概率性漏牌检查 |

**洗牌算法：** Fisher-Yates 洗牌 + xorshift 确定性 PRNG（支持 seed 参数用于测试）。

**发牌逻辑：** 创建 108 张牌 → 洗牌 → 每人发 13 张 → 剩余放入牌墙。

### 4.2 单机模拟服务器 (local-mock-server.ts)

`LocalMockServer` 是完整的游戏服务端模拟，处理所有 17 种动作：

**加入流程：**
1. 人类玩家加入 → 生成 guest ID
2. 自动补满 3 个机器人（电脑A/B/C，风格 normal/fast/loose）
3. 开始游戏（acceptanceMode 使用 seed=42 确定性发牌）

**回合流程：**
```
人类摸牌 → (可选提前拿牌) → 出牌 → 开启响应窗口
  → 机器人 40% 概率碰牌 → 确定碰/过 → 轮转
  → 机器人轮流摸打 → 回到人类回合
```

**机器人行为：**
- 摸牌后随机选一张出牌
- 碰牌窗口中 40% 概率碰（acceptanceMode 100%）
- 操作间隔 600-1200ms 模拟思考

**状态过滤：** `getVisibleState()` 隐藏其他玩家手牌，只暴露人类玩家的牌面信息。

### 4.3 行为分系统 (score/)

行为分范围 0-100，中心值 50。不是越高越好，也不是越低越好。

#### 行为分变化表 (behavior-score.ts)

| 行为 | 变化 |
|------|------|
| 质疑别人换牌 | +6 |
| 不允许慢碰 | +4 |
| 不允许撤回 | +4 |
| 要求退原牌 | +10 |
| 提前拿牌 | 0 |
| 提前拿牌不看 | 0 |
| 提前拿牌后看 | -2 |
| 漏牌 | 0 |
| 尝试换牌 | -5 |
| 换牌被发现 | -5（额外） |
| 打错牌撤回 | -4（基础） |

`applyBehaviorDelta(current, delta)` — 将 delta 加到 current 上，结果限制在 [0, 100]。

#### 催促算法 (urge.ts)

`getUrgeDelta(urgeCount)` — 根据本局被催促次数返回行为分变化：

| 次数 | 变化 |
|------|------|
| 1 | -1 |
| 2 | 0 |
| 3 | +1 |
| 4 | +2 |
| 5 | +4 |
| 6+ | +6 |

#### 撤回算法 (undo.ts)

总撤回分 = 基础分(-4) + 频率额外分 + 进度额外分

**频率额外分：**

| 第几次撤回 | 额外分 |
|-----------|--------|
| 1 | 0 |
| 2 | -2 |
| 3 | -5 |
| 4 | -9 |
| 5+ | -14 |

**进度额外分：**

| 下家进度 | 是否可撤 | 额外分 |
|---------|---------|--------|
| beforeDraw | 可以 | 0 |
| drawing | 可以 | -2 |
| inHand | 可以 | -4 |
| discarded | 不可以 | null |
| responseWindow | 不可以 | null |

返回 `null` 表示当前阶段不允许撤回。

#### 运势眷顾 (favor.ts)

`getFavorWeight(behaviorScore)` — 越接近中心值 50，眷顾权重越高：
```
权重 = max(5, 100 - |行为分 - 50| × 2)
```

`isFavored(behaviorScore)` — 概率性判定，随机数 < 权重则被眷顾。

#### 漏牌概率 (leak.ts)

`getLeakRate(behaviorScore, isFavored)`:
```
基础概率 = 0.08 + |行为分 - 50| × 0.005
如果被眷顾：基础概率 - 0.06
最终概率 = clamp(基础概率, 0.03, 0.35)
```

- 中心分 50：基础 8%，被眷顾降到 3%
- 极端分 0 或 100：基础 33%

`getLeakDirection()` — 50% 向左，50% 向右。

### 4.4 传输层 (transport/)

**LocalTransport：**
- 进程内直连 LocalMockServer
- `send()` 直接调用 `server.handleAction()`
- `onState()` / `onEvent()` 注册回调，server 通过 `emitState()` / `emitEvent()` 推送

**SocketTransport：**
- 基于 @stomp/stompjs
- 发送动作：发布到 `/app/game/action`
- 接收状态：订阅 `/topic/room/{roomId}`
- 接收私有事件：订阅 `/user/queue/private`
- 区分逻辑：消息有 `type` 字段为事件，否则为状态更新

---

## 五、前端应用 (apps/web)

### 5.1 Pinia 游戏商店 (stores/game.ts)

单源真相，管理所有游戏状态和操作。

**核心状态：**
- `gameState` — 服务器下发的完整游戏状态
- `events` — 事件日志（滚动保留 50 条）
- `playerId` — 自动检测的人类玩家 ID
- `connected` — 是否已加入游戏
- `selectedTileId` — 当前选中的手牌

**关键计算属性：**
- `isMyTurn` — 是否轮到我
- `canDiscard` / `canDraw` — 是否可出牌/摸牌
- `legalActions` — 当前合法操作列表
- `canPongDiscard` — 是否可碰最后出的牌
- `isInResponseWindow` / `responseWindowInfo` — 响应窗口状态
- `canUndo` — 是否可撤回
- `isWaitingForBot` — 是否在等机器人

**操作函数：** 14 个函数封装所有 ClientAction 发送，包括 `joinGame`、`drawTile`、`discardTile`、`claimPong`、`pass`、`urgePlayer` 等。

**传输层初始化：** 根据环境变量 `VITE_TRANSPORT_MODE` 选择 LocalTransport 或 SocketTransport。URL 参数 `?mode=acceptance` 启用确定性测试模式。

### 5.2 3D 场景组件 (3d/components/)

| 组件 | 职责 |
|------|------|
| `GameScene.vue` | TresCanvas 主场景，组合所有 3D 元素 |
| `GameTable.vue` | 绿色牌桌平面 + 边框装饰 |
| `TileMesh.vue` | 单张牌 3D 模型（BoxGeometry + Canvas 纹理） |
| `HandTiles.vue` | 手牌排列，支持选中抬升和双击出牌 |
| `WallTiles.vue` | 牌墙（最多 30 张暗牌） |
| `DiscardPile.vue` | 弃牌区网格布局 |
| `CurrentDiscardTile3D.vue` | 当前出牌高亮 |
| `AdvancedTile.vue` | 提前拿牌展示 |
| `SeatFocusRing.vue` | 当前回合座位脉冲光环 |

**3D 常量 (3d/utils/constants.ts)：**
- 牌尺寸：0.6 × 0.8 × 0.4
- 牌桌大小：8
- 手牌位置：Y=0.3, Z=3.5（靠近相机）
- 牌墙位置：Y=0.4, Z=-3.5（远处）
- 相机位置：[0, 6, 5.5]，看向 [0, 0, 1.5]

**TileMesh 渲染方案：**
- 使用 Canvas 纹理绘制牌面（数字 + 花色中文）
- 选中时黄色发光，高亮时橙色发光
- 背面为绿色平面

### 5.3 2D UI 组件 (components/)

| 组件 | 职责 |
|------|------|
| `ActionBar.vue` | 底部操作栏（渐变按钮：摸牌/出牌/碰/过/亮牌/撤回/催促） |
| `GameStatusBanner.vue` | 顶部磨砂玻璃状态栏 |
| `SeatHudLayer.vue` | 玩家信息 HUD（头像、手牌数、行为分） |
| `GameplayHandLayer.vue` | 2D 手牌层（大牌面、选中高亮） |
| `CurrentDiscardPanel.vue` | 出牌面板动画 |
| `DiscardAreaLayer.vue` | 弃牌区平铺 |
| `MeldAreaLayer.vue` | 碰杠组显示 |
| `PongDialog.vue` | 碰牌确认弹窗 |
| `UndoDialog.vue` | 撤回确认弹窗 |
| `ShowHandConfirmDialog.vue` | 亮牌确认弹窗 |
| `RoundResultDialog.vue` | 结算弹窗 |
| `GameOverDialog.vue` | 游戏结束弹窗 |
| `LeakIndicator.vue` | 漏牌方向指示器（眼睛 + 牌面 + 箭头） |
| `UrgeBubble.vue` | 催促气泡动画 |
| `TileFlyAnimation.vue` | 出牌飞行动画 |
| `NotificationToast.vue` | Toast 通知 |
| `RotateTip.vue` | 竖屏旋转提示 |

### 5.4 主视图 (views/GameView.vue)

页面结构：
```
game-shell (全屏深绿渐变背景)
├── loading-text（未连接时显示）
├── GameScene（v-if connected，3D 场景）
├── GameStatusBanner（状态栏）
├── SeatHudLayer（玩家 HUD）
├── CurrentDiscardPanel（出牌面板）
├── DiscardAreaLayer（弃牌区）
├── MeldAreaLayer（碰杠区）
├── event-log（对局记录，可展开）
├── ActionBar（操作栏）
├── TileFlyAnimation（飞行动画）
├── LeakIndicator（漏牌指示）
├── UrgeBubble（催促气泡）
├── GameplayHandLayer（手牌层）
├── debug-overlay（调试面板）
├── rotate-tip（竖屏提示）
├── PongDialog
├── ShowHandConfirmDialog
└── RoundResultDialog
```

**自动加入：** `onMounted` 时自动调用 `game.joinGame('玩家')`，无需手动点击。

**UI 风格：** 磨砂玻璃面板（backdrop-filter: blur）、渐变按钮带发光阴影、深绿色牌桌主题。

---

## 六、后端 (apps/server)

### 6.1 技术栈

- JDK 21 + Spring Boot 3.4.1
- Spring WebSocket + STOMP
- MySQL 8 + MyBatis-Plus 3.5.9
- Redis (Spring Data Redis)
- 阿里云 OSS SDK 3.17.4
- JUnit 5 测试

### 6.2 已实现模块

| 模块 | 状态 | 说明 |
|------|------|------|
| WebSocket 控制器 | 完成 | STOMP 端点 `/app/game/action`，房间主题 `/topic/room/{roomId}` |
| 17 个 Action 类 | 完成 | Java sealed interface 实现 |
| 16 个 Event 类 | 完成 | Java sealed interface 实现 |
| GameState/PlayerState/Tile | 完成 | 核心数据结构 |
| 5 个评分服务 | 完成 | BehaviorScoreService, FavorService, LeakService, UndoService, UrgeService |
| Redis 配置 | 完成 | 房间状态、锁服务 |
| MySQL 实体 | 完成 | PlayerGuest, GameRecord |
| MyBatis Mapper | 完成 | 基础 CRUD |
| OSS 服务 | 完成 | 阿里云 OSS 封装 |
| WebSocket 测试 | 完成 | 7 个测试类 |

### 6.3 未实现模块

| 模块 | 目录 | 说明 |
|------|------|------|
| 房间管理 | `game/room/` | 玩家排队、AI 补位、真人替换 |
| 麻将规则 | `game/rule/` | 武汉卡五星规则、胡牌判定 |
| AI 逻辑 | `game/ai/` | 机器人策略 |
| 完整游戏流程 | `GameService` | 存在但逻辑不完整 |

### 6.4 WebSocket 路径

```
客户端发送动作：/app/game/action
客户端订阅房间：/topic/room/{roomId}
客户端订阅私有：/user/queue/private
```

---

## 七、测试覆盖

| 包 | 测试文件数 | 覆盖范围 |
|---|---|---|
| `@kawuxing/protocol` | 1 | Action Zod schema 校验 |
| `@kawuxing/web-core` | 9 | 行为分、运势、漏牌、撤回、催促、游戏状态机、可玩流程、牌组、事件格式化 |
| `apps/server` | 7 | 游戏状态流转、5 个评分服务、WebSocket Controller、Redis key、Mapper |

---

## 八、已完成的功能清单

### 架构层
- [x] pnpm monorepo 工程结构
- [x] 前后端统一协议类型 (@kawuxing/protocol)
- [x] GameTransport 抽象接口
- [x] LocalTransport 单机模式
- [x] SocketTransport WebSocket 模式（代码已写，未联调）
- [x] 接受测试模式 (seed=42 确定性)

### 游戏逻辑层
- [x] 108 张牌生成与洗牌（支持 seed）
- [x] 发牌（每人 13 张）
- [x] 摸牌 / 出牌
- [x] 碰牌（响应窗口机制）
- [x] 杠牌
- [x] 提前拿牌 + 偷看
- [x] 漏牌机制（概率 + 方向）
- [x] 撤回出牌（行为分惩罚）
- [x] 催促系统（行为分变化）
- [x] 亮牌机制
- [x] 行为分系统（0-100，中心 50）
- [x] 运势眷顾（概率性奖励）
- [x] 胡牌（基础实现：设置 gameOver）
- [x] 机器人 AI（随机出牌，40% 碰牌）

### 前端 3D 层
- [x] TresCanvas 主场景
- [x] 绿色牌桌 3D 模型
- [x] 牌 3D 模型（BoxGeometry + Canvas 纹理）
- [x] 手牌排列 + 选中抬升
- [x] 牌墙显示
- [x] 弃牌区网格
- [x] 当前出牌高亮
- [x] 提前牌展示
- [x] 座位焦点光环

### 前端 UI 层
- [x] 操作栏（渐变按钮）
- [x] 磨砂玻璃状态栏
- [x] 玩家信息 HUD
- [x] 2D 手牌层
- [x] 出牌面板动画
- [x] 弃牌区 / 碰杠区显示
- [x] 碰牌 / 撤回 / 亮牌弹窗
- [x] 结算弹窗
- [x] 漏牌方向指示器
- [x] 催促气泡动画
- [x] 出牌飞行动画
- [x] 竖屏旋转提示
- [x] 横屏优先布局
- [x] 自动加入房间

---

## 九、未完成 / 待实现

### 高优先级
- [ ] 胡牌判定算法（武汉卡五星规则）
- [ ] 杠牌完整流程（明杠/暗杠/补杠）
- [ ] AI 策略增强（当前仅随机出牌）
- [ ] 后端房间管理（真人加入/离开/AI 补位）

### 中优先级
- [ ] 换牌 UI 和逻辑
- [ ] 退牌 UI 和逻辑
- [ ] 慢碰 UI 和逻辑
- [ ] 质疑换牌 UI 和逻辑
- [ ] 3D 动画增强（出牌飞行、碰牌动画、胡牌特效）
- [ ] 音效系统（Howler.js）
- [ ] 其他玩家手牌 3D 表现

### 低优先级
- [ ] 多房间支持
- [ ] 登录系统
- [ ] 历史战绩
- [ ] 自由视角相机
- [ ] 表情包 / 语音包
- [ ] 阿里云 OSS 资源上传
