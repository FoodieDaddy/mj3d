# CLAUDE.md

## 项目名称
## 项目目标

开发一个手机浏览器优先的 3D 武汉卡五星游戏。

核心特色不是普通麻将，而是“活桌动作系统”：

- 提前拿牌
- 提前拿牌后可选择看 / 不看
- 漏牌
- 退牌
- 换牌
- 打错牌撤回
- 慢碰
- 催促
- 行为分
- 运势眷顾
- 亮牌
- 3D 牌桌动作表现

---

# 一、技术栈约束

## 前端技术栈

必须使用：

- Vue 3
- TypeScript
- Vite
- Three.js
- TresJS
- Pinia
- Vue Router
- Zod
- Vitest

可使用：

- GSAP 或 tween.js：动画补间
- Howler.js：音效
- VueUse：浏览器能力封装

禁止第一阶段使用：

- Nuxt
- uniapp
- 小程序框架
- Flutter
- React Native
- 原生 Android / iOS
- PixiJS 作为主牌桌渲染

## 后端技术栈

必须使用：

- JDK 21
- Spring Boot
- Spring WebSocket + STOMP
- MySQL 8.0
- Redis
- 阿里云 OSS
- Maven
- JUnit 5

禁止后端使用：

- Node.js 作为正式服务端
- Socket.IO 作为正式联机协议
- MongoDB
- Firebase
- Supabase
- 小程序云开发

---

# 二、工程结构约束

项目使用前后端分离结构。

推荐结构：

```txt
kawuxing/
├─ apps/
│  ├─ web/                       # Vue 3 + Three.js 手机 H5
│  └─ server/                    # Spring Boot 后端
│
├─ packages/
│  ├─ protocol/                  # 前端 TypeScript 协议类型
│  ├─ web-core/                  # 前端单机模拟核心，可选
│  └─ shared/                    # 前端公共工具
│
├─ docs/
│  ├─ protocol.md                # 前后端协议说明
│  ├─ rules.md                   # 武汉卡五星规则说明
│  └─ actions.md                 # 活桌动作系统说明
│
├─ CLAUDE.md
├─ package.json
├─ pnpm-workspace.yaml
└─ README.md
````

后端结构：

```txt
apps/server/
├─ pom.xml
└─ src/main/java/com/kawuxing/
   ├─ KawuxingApplication.java
   │
   ├─ config/
   │  ├─ WebSocketConfig.java
   │  ├─ RedisConfig.java
   │  ├─ OssConfig.java
   │  └─ CorsConfig.java
   │
   ├─ websocket/
   │  ├─ GameSocketController.java
   │  ├─ GameMessagePublisher.java
   │  └─ WebSocketSessionRegistry.java
   │
   ├─ game/
   │  ├─ core/                  # 游戏状态机
   │  ├─ action/                # ClientAction
   │  ├─ event/                 # GameEvent
   │  ├─ room/                  # 单房间、排队、AI补位
   │  ├─ rule/                  # 武汉卡五星规则
   │  ├─ score/                 # 行为分、运势、漏牌、撤回
   │  └─ ai/                    # 电脑玩家
   │
   ├─ persistence/
   │  ├─ entity/
   │  ├─ mapper/
   │  └─ repository/
   │
   ├─ redis/
   │  ├─ RoomStateRedisRepository.java
   │  └─ GameLockService.java
   │
   ├─ oss/
   │  └─ OssService.java
   │
   └─ common/
      ├─ Result.java
      ├─ ErrorCode.java
      └─ JsonUtils.java
```

---

# 三、最重要架构原则

## 规则和表现必须分离

Three.js / TresJS 只负责表现层。

Vue 只负责页面 UI。

Spring Boot 后端负责权威规则、房间状态、联机同步和数据落库。

第一阶段前端可以有 LocalMockServer 模拟后端，但协议必须和正式后端一致。

正确流程：

```txt
用户点击 / 拖动 / 3D 交互
↓
ClientAction
↓
LocalTransport 或 SocketTransport
↓
GameCore
↓
GameState / GameEvent
↓
Vue + Three.js 渲染
```

禁止流程：

```txt
Vue 组件直接修改手牌
Three.js 动画完成后直接改规则状态
AI 直接改 GameState
Controller 里直接写麻将规则
```

---

# 四、单机和联机统一接口

虽然第一阶段先做单机版，但必须按联机架构设计。

前端必须定义：

```ts
interface GameTransport {
  send(action: ClientAction): void
  onState(callback: (state: GameState) => void): void
  onEvent(callback: (event: GameEvent) => void): void
}
```

第一阶段使用：

```ts
LocalTransport
```

未来联机使用：

```ts
SocketTransport
```

规则：

* LocalTransport 调用 LocalMockServer
* SocketTransport 连接 Spring WebSocket
* AI 也必须通过 ClientAction 玩牌
* AI 禁止直接修改 GameState

---

# 五、后端职责

Spring Boot 后端负责：

1. WebSocket 连接管理
2. 单房间管理
3. 玩家加入 / 离开 / 排队
4. AI 补位
5. 游戏 Action 接收
6. GameCore 状态推进
7. GameEvent 广播
8. Redis 保存实时房间状态
9. MySQL 保存长期数据
10. OSS 保存静态资源、音效、模型、贴图、语音包、表情包等资源

---

# 六、WebSocket 协议约束

后端使用 Spring WebSocket + STOMP。

推荐路径：

```txt
客户端发送 Action：
/app/game/action

客户端订阅房间事件：
/topic/room/{roomId}

客户端订阅个人私密事件：
/user/queue/private
```

所有客户端动作必须封装为 ClientAction。

所有服务端广播必须封装为 GameEvent。

禁止前端调用多个零散接口直接修改游戏状态。

每个消息必须带基础字段：

```json
{
  "protocolVersion": 1,
  "actionId": "uuid",
  "roomId": "main",
  "playerId": "guest_xxx",
  "type": "DISCARD_TILE",
  "payload": {}
}
```

---

# 七、Java Action 设计约束

后端 Action 推荐使用 Java sealed interface。

```java
public sealed interface ClientAction permits
        JoinRoomAction,
        DrawTileAction,
        PeekAdvancedTileAction,
        PutTileInHandAction,
        DiscardTileAction,
        RequestUndoDiscardAction,
        AllowUndoAction,
        DenyUndoAction,
        ClaimPongAction,
        ClaimKongAction,
        ClaimWinAction,
        PassAction,
        ShowHandAction,
        UrgePlayerAction,
        QuestionTileSwapAction,
        RequireOriginalReturnAction,
        TrySwapReturnTileAction {
}
```

Action 示例：

```java
public record DiscardTileAction(
        String protocolVersion,
        String actionId,
        String roomId,
        String playerId,
        String tileId
) implements ClientAction {
}
```

---

# 八、Java Event 设计约束

后端 Event 推荐使用 Java sealed interface。

```java
public sealed interface GameEvent permits
        PlayerJoinedEvent,
        PlayerLeftEvent,
        BotFilledEvent,
        TileDrawnEvent,
        AdvancedTilePeekedEvent,
        TileLeakedEvent,
        TilePutInHandEvent,
        TileDiscardedEvent,
        UndoRequestedEvent,
        UndoAcceptedEvent,
        UndoDeniedEvent,
        BehaviorScoreChangedEvent,
        PlayerUrgedEvent,
        HandShownEvent,
        WinDeclaredEvent {
}
```

Event 示例：

```java
public record TileLeakedEvent(
        String roomId,
        String gameId,
        String playerId,
        String viewerId,
        String tileId
) implements GameEvent {
}
```

Three.js 根据 GameEvent 播放动画。

后端 GameCore 不直接控制前端动画。

---

# 九、Redis 使用约束

Redis 用于保存实时状态，不作为长期数据库。

Redis 保存：

* 当前单房间状态
* 玩家座位
* 排队列表
* WebSocket session 映射
* 当前局 GameState 快照
* 当前局临时事件
* 分布式锁
* 防重复 action nonce

Redis key 命名：

```txt
kwx:room:main:state
kwx:room:main:queue
kwx:player:{playerId}:session
kwx:game:{gameId}:state
kwx:game:{gameId}:lock
kwx:action:{actionId}
```

所有会改变牌局状态的 action 必须加锁处理。

禁止多个 action 并发修改同一局 GameState。

---

# 十、MySQL 使用约束

MySQL 8.0 用于长期数据。

第一阶段最少表：

```txt
player_guest
game_record
game_round_record
behavior_score_log
asset_record
```

游客不需要登录，但仍然生成 guestId。

guestId 保存在浏览器 localStorage 中。

MySQL 不负责实时牌局同步。

实时状态以 Redis + 后端内存状态为主。

---

# 十一、OSS 使用约束

阿里云 OSS 用于存储：

* 3D 模型资源
* 麻将牌贴图
* 音效
* 搞笑语音包
* 表情包
* 后续用户上传头像

第一阶段可以先使用本地静态资源。

但必须封装 OssService。

禁止前端或业务代码直接依赖 OSS SDK。

---

# 十二、3D 牌桌约束

## 必须使用真 3D

牌桌必须使用 Three.js / TresJS 实现。

第一版使用固定视角。

后期预留自由视角。

## 相机约束

第一版允许：

* fixed_mobile
* seat_focus

后期预留：

* inspect_table
* free_orbit

必须封装 CameraController。

```ts
type CameraMode =
  | 'fixed_mobile'
  | 'seat_focus'
  | 'inspect_table'
  | 'free_orbit'

interface CameraController {
  setMode(mode: CameraMode): void
  focusSeat(seatId: SeatId): void
  focusTile(tileId: string): void
  lock(): void
  unlock(): void
}
```

禁止在业务组件中散落：

```txt
camera.position.set(...)
camera.lookAt(...)
```

---

# 十三、禁止写死屏幕坐标

所有牌、玩家、牌墙、弃牌区必须使用 3D 世界坐标。

禁止用固定屏幕坐标判断点击了哪张牌。

所有 3D 交互必须通过 Raycaster。

```ts
tileMesh.userData = {
  type: 'tile',
  tileId: 'tile_038',
  action: 'select_tile'
}
```

UI 气泡、头像提示可以用 worldToScreen 转换。

```ts
function worldToScreen(position: Vec3): { x: number; y: number }
```

---

# 十四、3D 表现优先级

第一阶段必须优先做好这些动作：

1. 摸牌
2. 提前拿牌
3. 拿牌后选择看 / 不看
4. 漏牌方向
5. 放到手牌
6. 出牌
7. 撤回
8. 退牌
9. 换牌
10. 催促动作
11. 亮牌
12. 胡牌表现

暂时不要做复杂 3D 人物。

第一阶段玩家可以用：

* 3D 头像牌
* 简单表情气泡
* 敲桌小手
* 冒汗 / 冒火 / 震动特效

---

# 十五、游戏人数与房间约束

第一阶段只允许一个房间。

不需要登录。

玩家进入后自动生成游客身份。

```ts
type PlayerType = 'human' | 'bot'
```

规则：

* 一桌 3 人
* 真人不足时 AI 补满
* 真人加入时可以替换 AI
* 真人离开时 AI 接管
* 多余真人进入排队
* 排队系统先预留，第一版可以弱实现

---

# 十六、麻将玩法约束

玩法为武汉卡五星。

已确定规则：

* 可以亮牌
* 用户手上没有倍率牌时，必须亮牌才能和牌
* 亮牌输赢翻倍

规则细节可以后续完善。

第一阶段优先做动作系统和基础流程。

基础流程必须包括：

* 发牌
* 摸牌
* 出牌
* 碰
* 杠
* 胡
* 过
* 亮牌
* 结算占位

复杂倍率规则后续补。

---

# 十七、下家动作阶段

由于网络延迟，下家动作阶段只保留四个。

不提前拿牌时：

```txt
0. 摸牌前
1. 摸牌
2. 放到手牌
3. 出牌
```

提前拿牌时：

```txt
1. 摸牌
2. 放到手牌
3. 出牌
```

禁止引入更多中间阶段，例如：

* touched
* pickedButNotSeen
* peeked
* locked
* returnSlot

除非后续明确要求。

---

# 十八、提前拿牌规则

统一名词：提前拿牌。

不是提前看牌。

提前拿牌用于抵消网络延迟，让牌桌不断流。

提前拿牌本身不扣行为分。

玩家提前拿牌后，可以选择：

* 看
* 不看

规则：

```txt
提前拿牌：行为分不变
提前拿牌后不看：行为分不变
提前拿牌后看：行为分 -2
```

其他玩家不知道他是否看牌。

系统知道。

---

# 十九、漏牌规则

漏牌只和“提前拿牌动作”相关。

不管玩家看不看牌，漏牌概率相同。

漏牌不扣行为分。

漏牌不分轻微、中等、严重。

```txt
漏了 = 左边或右边某个玩家看清具体牌
没漏 = 没人看见
```

漏牌方向随机：

```txt
50% 向左
50% 向右
```

漏牌后不需要设计“戳穿漏牌”行为。

看到的人自己知道即可。

---

# 二十、行为分规则

游戏只有一个社交数值：行为分。

范围：

```txt
0 - 100
```

含义：

```txt
分低：偏友好、偏随性、偏江湖
分高：偏信誉、偏规矩、偏严格
中间：最懂分寸，最容易被眷顾
```

行为分不是越高越好，也不是越低越好。

最优区间在 50 附近。

---

# 二十一、行为分变化表

必须按以下规则实现：

| 行为        | 行为分变化 |
| --------- | ----: |
| 质疑别人换牌    |    +6 |
| 不允许别人慢碰   |    +4 |
| 不允许别人撤回   |    +4 |
| 要求别人必须退原牌 |   +10 |
| 提前拿牌      |     0 |
| 提前拿牌后不看   |     0 |
| 提前拿牌后看牌   |    -2 |
| 提前拿牌时漏牌   |     0 |
| 尝试换牌      |    -5 |
| 换牌被发现     | 额外 -5 |
| 打错牌请求撤回   |    -4 |
| 催促别人      | 按催促算法 |
| 频繁撤回      | 按撤回算法 |

禁止实现：

* 友好度
* 信誉值
* 心虚值
* 戳穿漏牌分
* 漏牌扣分

只能使用行为分。

---

# 二十二、催促算法

记录玩家本局催促次数：

```ts
urgeCount: number
```

行为分变化：

|   本局催促次数 | 行为分变化 |
| -------: | ----: |
|    第 1 次 |    -1 |
|    第 2 次 |     0 |
|    第 3 次 |    +1 |
|    第 4 次 |    +2 |
|    第 5 次 |    +4 |
| 第 6 次及以后 |    +6 |

TypeScript 实现：

```ts
export function getUrgeDelta(urgeCount: number): number {
  if (urgeCount === 1) return -1
  if (urgeCount === 2) return 0
  if (urgeCount === 3) return 1
  if (urgeCount === 4) return 2
  if (urgeCount === 5) return 4
  return 6
}
```

Java 实现：

```java
public int getUrgeDelta(int urgeCount) {
    if (urgeCount == 1) return -1;
    if (urgeCount == 2) return 0;
    if (urgeCount == 3) return 1;
    if (urgeCount == 4) return 2;
    if (urgeCount == 5) return 4;
    return 6;
}
```

---

# 二十三、撤回规则

打错牌可以请求撤回。

最多只能撤到下家出完牌之前。

下家已经出完牌后，不能撤回。

下家进度只允许以下四种：

```ts
type NextPlayerStage =
  | 'beforeDraw'
  | 'drawing'
  | 'inHand'
  | 'discarded'
```

撤回基础变化：

```txt
打错牌请求撤回：-4
```

撤回次数额外扣分：

|  本局第几次撤回 | 额外扣分 |
| -------: | ---: |
|    第 1 次 |    0 |
|    第 2 次 |   -2 |
|    第 3 次 |   -5 |
|    第 4 次 |   -9 |
| 第 5 次及以后 |  -14 |

TypeScript：

```ts
export function getUndoFrequencyDelta(undoCount: number): number {
  if (undoCount <= 1) return 0
  if (undoCount === 2) return -2
  if (undoCount === 3) return -5
  if (undoCount === 4) return -9
  return -14
}
```

Java：

```java
public int getUndoFrequencyDelta(int undoCount) {
    if (undoCount <= 1) return 0;
    if (undoCount == 2) return -2;
    if (undoCount == 3) return -5;
    if (undoCount == 4) return -9;
    return -14;
}
```

下家进度额外扣分：

| 下家进度       | 是否可撤 | 额外扣分 |
| ---------- | ---- | ---: |
| beforeDraw | 可以   |    0 |
| drawing    | 可以   |   -2 |
| inHand     | 可以   |   -4 |
| discarded  | 不可以  |  不可撤 |

TypeScript：

```ts
export function getUndoProgressDelta(stage: NextPlayerStage): number | null {
  const map: Record<NextPlayerStage, number | null> = {
    beforeDraw: 0,
    drawing: -2,
    inHand: -4,
    discarded: null,
  }

  return map[stage]
}
```

Java：

```java
public Integer getUndoProgressDelta(NextPlayerStage stage) {
    return switch (stage) {
        case BEFORE_DRAW -> 0;
        case DRAWING -> -2;
        case IN_HAND -> -4;
        case DISCARDED -> null;
    };
}
```

总撤回变化：

```ts
export function getUndoDelta(
  undoCount: number,
  nextPlayerStage: NextPlayerStage
): number | null {
  const base = -4
  const progressDelta = getUndoProgressDelta(nextPlayerStage)

  if (progressDelta === null) {
    return null
  }

  return base + getUndoFrequencyDelta(undoCount) + progressDelta
}
```

---

# 二十四、运势眷顾规则

每把牌开始，根据行为分计算眷顾权重。

越接近 50，权重越高。

TypeScript：

```ts
export function getFavorWeight(behaviorScore: number): number {
  const center = 50
  const distance = Math.abs(behaviorScore - center)

  return Math.max(5, 100 - distance * 2)
}
```

Java：

```java
public int getFavorWeight(int behaviorScore) {
    int center = 50;
    int distance = Math.abs(behaviorScore - center);
    return Math.max(5, 100 - distance * 2);
}
```

眷顾只允许影响：

* 边缘动作
* 时间宽容
* 漏牌概率
* 系统文案
* 撤回台阶
* 轻度争议判定

眷顾禁止影响：

* 牌序
* 摸到什么牌
* 胡牌结果
* 碰杠胡硬规则
* 已经公开的信息
* 已经完成且锁定的动作

---

# 二十五、漏牌概率

漏牌概率由行为分和是否被眷顾决定。

看不看牌不影响漏牌概率。

TypeScript：

```ts
export function getLeakRate(
  behaviorScore: number,
  isFavored: boolean
): number {
  const center = 50
  const distance = Math.abs(behaviorScore - center)

  let rate = 0.08 + distance * 0.005

  if (isFavored) {
    rate -= 0.06
  }

  return Math.max(0.03, Math.min(rate, 0.35))
}
```

Java：

```java
public double getLeakRate(int behaviorScore, boolean favored) {
    int center = 50;
    int distance = Math.abs(behaviorScore - center);

    double rate = 0.08 + distance * 0.005;

    if (favored) {
        rate -= 0.06;
    }

    return Math.max(0.03, Math.min(rate, 0.35));
}
```

---

# 二十六、前端 Action 类型约束

前端 packages/protocol 必须定义统一 ClientAction。

```ts
type ClientAction =
  | { type: 'ROOM_JOIN'; playerName?: string }
  | { type: 'DRAW_TILE'; playerId: string; advance: boolean }
  | { type: 'PEEK_ADVANCED_TILE'; playerId: string }
  | { type: 'PUT_TILE_IN_HAND'; playerId: string; tileId: string }
  | { type: 'DISCARD_TILE'; playerId: string; tileId: string }
  | { type: 'REQUEST_UNDO_DISCARD'; playerId: string; tileId: string }
  | { type: 'ALLOW_UNDO'; playerId: string; targetPlayerId: string }
  | { type: 'DENY_UNDO'; playerId: string; targetPlayerId: string }
  | { type: 'CLAIM_PONG'; playerId: string; tileId: string }
  | { type: 'CLAIM_KONG'; playerId: string; tileId: string }
  | { type: 'CLAIM_WIN'; playerId: string; tileId?: string }
  | { type: 'PASS'; playerId: string }
  | { type: 'SHOW_HAND'; playerId: string }
  | { type: 'URGE_PLAYER'; playerId: string; targetPlayerId: string }
  | { type: 'QUESTION_TILE_SWAP'; playerId: string; targetPlayerId: string }
  | { type: 'REQUIRE_ORIGINAL_RETURN'; playerId: string; targetPlayerId: string }
  | { type: 'TRY_SWAP_RETURN_TILE'; playerId: string; tileId: string }
```

所有 action 必须用 Zod 校验。

---

# 二十七、前端 GameEvent 类型约束

```ts
type GameEvent =
  | { type: 'PLAYER_JOINED'; playerId: string }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'BOT_FILLED'; playerId: string }
  | { type: 'TILE_DRAWN'; playerId: string; tileId: string; advanced: boolean }
  | { type: 'ADVANCED_TILE_PEEKED'; playerId: string; tileId: string }
  | { type: 'TILE_LEAKED'; playerId: string; viewerId: string; tileId: string }
  | { type: 'TILE_PUT_IN_HAND'; playerId: string; tileId: string }
  | { type: 'TILE_DISCARDED'; playerId: string; tileId: string }
  | { type: 'UNDO_REQUESTED'; playerId: string; tileId: string }
  | { type: 'UNDO_ACCEPTED'; playerId: string; tileId: string }
  | { type: 'UNDO_DENIED'; playerId: string; tileId: string }
  | { type: 'BEHAVIOR_SCORE_CHANGED'; playerId: string; delta: number; reason: string }
  | { type: 'PLAYER_URGED'; playerId: string; targetPlayerId: string }
  | { type: 'HAND_SHOWN'; playerId: string }
  | { type: 'WIN_DECLARED'; playerId: string }
```

---

# 二十八、AI 约束

AI 必须通过 ClientAction 行动。

AI 第一阶段只需要可玩，不需要强。

AI 类型：

```ts
type BotStyle =
  | 'normal'
  | 'fast'
  | 'loose'
  | 'strict'
```

AI 行为倾向：

* normal：正常摸打
* fast：更喜欢提前拿牌
* loose：更容易看牌、撤回、换牌
* strict：更容易质疑、要求退原牌、不让撤回

AI 不能作弊读取不该知道的信息。

如果某张牌通过漏牌事件给 AI 看到，可以记录为 AI 已知信息。

---

# 二十九、前后端协议同步

后端 Java DTO 是权威。

同时维护：

```txt
docs/protocol.md
```

前端 packages/protocol 手写对应 TypeScript 类型。

每次协议修改必须同步：

* Java DTO
* TypeScript 类型
* Zod schema
* docs/protocol.md
* 测试用例

所有消息必须带：

```txt
protocolVersion
actionId
roomId
playerId
type
payload
```

---

# 三十、测试要求

## 前端测试

前端使用 Vitest。

最低测试范围：

* Action schema 校验
* LocalTransport
* LocalMockServer
* 行为分算法
* 催促算法
* 撤回算法
* 运势权重
* 漏牌概率
* 漏牌方向
* 下家出牌后不可撤回

## 后端测试

后端使用 JUnit 5。

最低测试范围：

* 行为分变化
* 催促算法
* 撤回算法
* 运势权重
* 漏牌概率
* 提前拿牌看 / 不看
* 下家出牌后不可撤回
* AI 只能通过 action 行动
* 亮牌基础条件
* Redis 房间状态读写
* WebSocket action 分发

禁止没有测试就修改核心规则。

---

# 三十一、代码风格

必须：

* 前端全 TypeScript
* 后端使用 Java 21
* 规则函数尽量纯函数
* 规则放 game/core、game/rule、game/score
* 协议类型放 protocol / action / event
* UI 不写规则
* 3D 不写规则
* AI 不直接改状态
* Controller 不写麻将规则
* WebSocket Controller 只负责接收 action 和分发 service

禁止：

* any 滥用
* 魔法字符串散落各处
* 在 Vue 组件里写复杂规则判断
* 在 Three.js 动画回调里改 GameState
* 在 Spring Controller 里写游戏规则
* 将麻将牌直接用中文字符串作为唯一 ID

---


# 最终原则

这个项目的核心不是普通麻将，而是“真实牌桌动作感”。

必须优先保证：

* 3D 拿牌好看
* 提前拿牌不卡顿
* 漏牌有方向
* 撤回有台阶
* 催促有情绪
* 行为分有分寸
* 运势眷顾不破坏公平
* 单机和联机架构统一
* 前端表现和后端规则彻底分离

```

这版已经把后端完全改成 **JDK21 + Spring Boot + MySQL8 + Redis + 阿里云 OSS** 了，前端仍然是 **Vue 3 + Three.js/TresJS**。
```

