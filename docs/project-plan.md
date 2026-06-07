# 来卡 - 项目实施计划

## 项目概述

开发手机浏览器优先的 3D 武汉卡五星游戏，核心特色是"活桌动作系统"。

- 前端：Vue 3 + TypeScript + Vite + Three.js/TresJS
- 后端：JDK 21 + Spring Boot + MySQL 8.0 + Redis + 阿里云 OSS
- 第一阶段目标：单机可玩，3D 牌桌动作流畅，协议预留联机能力

---

## Phase 1: 项目脚手架 + 协议定义

> 对应 CLAUDE.md 步骤 1-5

### 1.1 前端项目初始化

**目标：** 搭建 Vue 3 + Vite + TypeScript monorepo 骨架

**任务：**
- 初始化 pnpm workspace monorepo
- 创建 `apps/web/` — Vue 3 + Vite + TypeScript
- 创建 `packages/protocol/` — 协议类型定义
- 创建 `packages/web-core/` — 单机模拟核心
- 创建 `packages/shared/` — 公共工具
- 配置 ESLint、Prettier、tsconfig
- 安装核心依赖：Vue 3、Pinia、Vue Router、Zod、Three.js、TresJS
- 安装开发依赖：Vitest、GSAP/tween.js、Howler.js、VueUse

**产出：**
```
kawuxing/
├─ apps/web/           # 可启动的 Vue 3 空项目
├─ packages/protocol/  # 空包，待填充类型
├─ packages/web-core/  # 空包
├─ packages/shared/    # 空包
├─ pnpm-workspace.yaml
└─ package.json
```

### 1.2 后端项目初始化

**目标：** 搭建 Spring Boot JDK 21 项目骨架

**任务：**
- 使用 Maven 初始化 Spring Boot 3.x 项目（JDK 21）
- 配置基础依赖：Spring WebSocket、Spring Data Redis、MyBatis-Plus、MySQL 驱动
- 创建包结构：config、websocket、game、persistence、redis、oss、common
- 配置 application.yml 基础模板
- 创建 KawuxingApplication.java 入口

**产出：**
```
apps/server/
├─ pom.xml
└─ src/main/java/com/kawuxing/
   ├─ KawuxingApplication.java
   ├─ config/
   ├─ websocket/
   ├─ game/
   ├─ persistence/
   ├─ redis/
   ├─ oss/
   └─ common/
```

### 1.3 协议文档

**目标：** 定义前后端通信协议

**任务：**
- 编写 `docs/protocol.md` — 完整协议说明
- 定义消息基础结构：protocolVersion、actionId、roomId、playerId、type、payload
- 定义 WebSocket 路径：
  - 客户端发送：`/app/game/action`
  - 房间事件订阅：`/topic/room/{roomId}`
  - 私密事件订阅：`/user/queue/private`

**产出：** `docs/protocol.md`

### 1.4 前端协议类型

**目标：** 定义前端 TypeScript 协议类型和 Zod 校验

**任务：**
- 在 `packages/protocol/` 定义 `ClientAction` 联合类型（16 种 action）
- 定义 `GameEvent` 联合类型（15 种 event）
- 为每种 action 编写 Zod schema
- 导出所有类型和 schema

**核心 Action 类型：**
- ROOM_JOIN、DRAW_TILE、PEEK_ADVANCED_TILE、PUT_TILE_IN_HAND
- DISCARD_TILE、REQUEST_UNDO_DISCARD、ALLOW_UNDO、DENY_UNDO
- CLAIM_PONG、CLAIM_KONG、CLAIM_WIN、PASS
- SHOW_HAND、URGE_PLAYER、QUESTION_TILE_SWAP、REQUIRE_ORIGINAL_RETURN、TRY_SWAP_RETURN_TILE

**产出：** `packages/protocol/src/` 完整类型定义

### 1.5 后端 Action/Event DTO

**目标：** 定义后端 Java DTO

**任务：**
- 使用 sealed interface 定义 `ClientAction`（16 种）
- 使用 sealed interface 定义 `GameEvent`（15 种）
- 每种 action/event 使用 record 实现
- 确保字段与前端 TypeScript 类型一一对应

**产出：** `game/action/` 和 `game/event/` 包下的所有 DTO

### 1.6 协议文档同步

**目标：** 确保四份定义保持一致

**任务：**
- 核对：Java DTO ↔ TypeScript 类型 ↔ Zod schema ↔ protocol.md
- 建立同步检查清单

**Phase 1 依赖关系：**
```
1.1 前端初始化 ──┐
                 ├── 1.3 协议文档 ── 1.4 前端类型 ──┐
1.2 后端初始化 ──┘                   1.5 后端 DTO ──┼── 1.6 同步检查
                                                   ┘
```

---

## Phase 2: 核心规则算法

> 对应 CLAUDE.md 步骤 6-9

### 2.1 行为分规则

**目标：** 实现行为分变化逻辑

**任务：**
- 定义行为分范围：0-100
- 实现行为分变化表（质疑换牌 +6、不允许慢碰 +4、不允许撤回 +4、要求退原牌 +10、提前拿牌 0、提前拿牌后看 -2、尝试换牌 -5、换牌被发现额外 -5、打错牌撤回 -4）
- 前端纯函数 + 后端纯函数
- 前后端单测覆盖所有变化场景

**产出：**
- `packages/web-core/src/score/behavior-score.ts`
- `apps/server/src/main/java/com/kawuxing/game/score/BehaviorScoreService.java`
- 对应测试文件

### 2.2 催促算法

**目标：** 实现催促次数与行为分变化的映射

**任务：**
- 实现 `getUrgeDelta(urgeCount)` 函数
- 规则：第1次 -1、第2次 0、第3次 +1、第4次 +2、第5次 +4、第6次及以后 +6
- 前后端纯函数 + 单测

**产出：**
- `packages/web-core/src/score/urge.ts`
- `apps/server/src/main/java/com/kawuxing/game/score/UrgeService.java`
- 对应测试文件

### 2.3 撤回算法

**目标：** 实现撤回行为分计算

**任务：**
- 实现撤回基础分：-4
- 实现撤回次数额外扣分：第1次 0、第2次 -2、第3次 -5、第4次 -9、第5次及以后 -14
- 实现下家进度判断：beforeDraw(0)、drawing(-2)、inHand(-4)、discarded(不可撤)
- 实现总撤回分计算：`getUndoDelta(undoCount, nextPlayerStage)`
- 前后端纯函数 + 单测

**产出：**
- `packages/web-core/src/score/undo.ts`
- `apps/server/src/main/java/com/kawuxing/game/score/UndoService.java`
- 对应测试文件

### 2.4 运势眷顾规则

**目标：** 实现眷顾权重和眷顾判定

**任务：**
- 实现眷顾权重：`getFavorWeight(behaviorScore)` — 越接近 50 权重越高
- 眷顾影响范围：边缘动作、时间宽容、漏牌概率、系统文案、撤回台阶、轻度争议判定
- 眷顾禁止影响：牌序、摸牌结果、胡牌结果、碰杠胡硬规则
- 前后端纯函数 + 单测

**产出：**
- `packages/web-core/src/score/favor.ts`
- `apps/server/src/main/java/com/kawuxing/game/score/FavorService.java`
- 对应测试文件

### 2.5 漏牌算法

**目标：** 实现漏牌概率和漏牌方向

**任务：**
- 实现漏牌概率：`getLeakRate(behaviorScore, isFavored)`
- 基础概率 0.08，距离中心每 1 增加 0.005，眷顾时减少 0.06，范围 [0.03, 0.35]
- 实现漏牌方向：50% 向左、50% 向右
- 看不看牌不影响漏牌概率
- 前后端纯函数 + 单测

**产出：**
- `packages/web-core/src/score/leak.ts`
- `apps/server/src/main/java/com/kawuxing/game/score/LeakService.java`
- 对应测试文件

### 2.6 规则测试汇总

**目标：** 确保所有规则算法测试通过

**任务：**
- 前端：`pnpm test` 全部通过
- 后端：`mvn test` 全部通过
- 覆盖率检查

**Phase 2 依赖关系：**
```
2.1 行为分 ──┐
2.2 催促   ──┼── 2.6 测试汇总
2.3 撤回   ──┤
2.4 运势   ──┤
2.5 漏牌   ──┘
```
> 2.1-2.5 相互独立，可并行开发；2.4 运势依赖 2.1 行为分接口

---

## Phase 3: 传输层 + AI

> 对应 CLAUDE.md 步骤 10-11

### 3.1 GameTransport 接口

**目标：** 定义统一传输接口

**任务：**
- 定义 `GameTransport` 接口：
  - `send(action: ClientAction): void`
  - `onState(callback: (state: GameState) => void): void`
  - `onEvent(callback: (event: GameEvent) => void): void`
- 确保 LocalTransport 和 SocketTransport 实现同一接口

**产出：** `packages/protocol/src/transport.ts`

### 3.2 LocalTransport

**目标：** 实现本地传输层

**任务：**
- 实现 `LocalTransport` — 调用 LocalMockServer
- 实现消息序列化/反模拟
- 确保与未来 SocketTransport 接口一致

**产出：** `packages/web-core/src/transport/local-transport.ts`

### 3.3 LocalMockServer

**目标：** 实现本地模拟后端

**任务：**
- 实现 LocalMockServer — 接收 ClientAction，返回 GameState 和 GameEvent
- 实现基础游戏状态机
- 实现发牌、摸牌、出牌、碰、杠、胡的基础逻辑
- 管理单房间 3 人座位
- 模拟 AI 补位

**产出：** `packages/web-core/src/server/local-mock-server.ts`

### 3.4 简单 AI

**目标：** 实现可玩的 AI 玩家

**任务：**
- 定义 AI 类型：normal、fast、loose、strict
- AI 通过 ClientAction 行动，禁止直接修改 GameState
- normal：正常摸打
- fast：更喜欢提前拿牌
- loose：更容易看牌、撤回、换牌
- strict：更容易质疑、要求退原牌
- AI 不能作弊读取不该知道的信息

**产出：** `packages/web-core/src/ai/`

**Phase 3 依赖关系：**
```
3.1 GameTransport 接口 ── 3.2 LocalTransport ── 3.3 LocalMockServer ── 3.4 AI
```

---

## Phase 4: UI + 3D + 基础流程

> 对应 CLAUDE.md 步骤 12-15

### 4.1 Vue 页面骨架

**目标：** 搭建基础页面结构

**任务：**
- 创建主页面布局（手机优先）
- 配置 Vue Router
- 配置 Pinia store（游戏状态、玩家信息）
- 创建基础 UI 组件：玩家头像、手牌区、弃牌区、操作按钮

**产出：** `apps/web/src/` 页面骨架

### 4.2 Three.js 牌桌场景

**目标：** 搭建 3D 牌桌基础场景

**任务：**
- 使用 TresJS 创建 3D 场景
- 创建牌桌 3D 模型（平面 + 简单装饰）
- 创建麻将牌 3D 模型（基础方块 + 贴图）
- 实现 4 个座位的牌墙布局
- 实现弃牌区布局
- 封装 CameraController（固定视角 fixed_mobile）

**产出：** `apps/web/src/3d/` 场景相关文件

### 4.3 Raycaster 交互

**目标：** 实现 3D 牌的点击/拖动交互

**任务：**
- 实现 Raycaster 点击检测
- 为每张牌设置 userData（type、tileId、action）
- 禁止使用屏幕坐标判断点击
- 实现 worldToScreen 转换（用于 UI 气泡定位）

**产出：** `apps/web/src/3d/interaction.ts`

### 4.4 摸牌/出牌动画

**目标：** 实现基础摸牌和出牌 3D 动画

**任务：**
- 摸牌动画：从牌墙移动到手牌区
- 出牌动画：从手牌区移动到弃牌区
- 使用 GSAP 或 tween.js 做补间动画
- 动画完成后触发 GameEvent

**产出：** `apps/web/src/3d/animations/`

### 4.5 提前拿牌流程

**目标：** 实现提前拿牌、看/不看交互

**任务：**
- 提前拿牌动画：从牌墙取出但不亮明
- 看牌：翻转显示（行为分 -2）
- 不看：保持背面
- 放到手牌动画

**产出：** 集成到动画和交互模块

### 4.6 基础流程跑通

**目标：** 端到端基础流程可玩

**任务：**
- 发牌 → 摸牌 → 出牌 → 碰/杠/胡 → 过
- 使用 LocalTransport + LocalMockServer
- AI 自动补位
- 基础 UI 显示当前状态

**Phase 4 依赖关系：**
```
4.1 Vue 骨架 ──┐
4.2 3D 场景  ──┼── 4.3 Raycaster ── 4.4 动画 ── 4.5 提前拿牌 ── 4.6 基础流程
               ┘
```

---

## Phase 5: 活桌动作系统

> 对应 CLAUDE.md 步骤 16-20

### 5.1 漏牌实现

**目标：** 实现漏牌的 3D 表现和事件处理

**任务：**
- 漏牌事件触发时，向左或向右 50% 概率
- 被漏牌的玩家看到具体牌面（通过 GameEvent）
- 漏牌方向的视觉提示（牌微微倾斜/闪光）
- 漏牌不影响游戏规则状态

**产出：** 漏牌动画和事件处理模块

### 5.2 撤回实现

**目标：** 实现打错牌撤回的完整流程

**任务：**
- 出牌后显示"请求撤回"按钮
- 下家进度检查：beforeDraw/drawing/inHand 可撤，discarded 不可撤
- 撤回请求发送给其他玩家
- 其他人可选择允许/拒绝
- 撤回成功：牌回到手牌，弃牌区移除
- 撤回失败：显示提示
- 行为分自动计算

**产出：** 撤回 UI 流程和动画

### 5.3 催促实现

**目标：** 实现催促其他玩家的交互

**任务：**
- 催促按钮（当其他玩家操作超时时）
- 催促动画：敲桌小手、冒汗/冒火特效
- 被催促玩家收到提示
- 行为分按催促算法变化

**产出：** 催促 UI 和动画

### 5.4 亮牌实现

**目标：** 实现亮牌功能

**任务：**
- 亮牌按钮（手牌区）
- 亮牌条件：用户手上没有倍率牌时，必须亮牌才能和牌
- 亮牌后手牌对所有人可见
- 亮牌输赢翻倍

**产出：** 亮牌 UI 和逻辑

### 5.5 基础胡牌实现

**目标：** 实现胡牌判定和表现

**任务：**
- 胡牌判定逻辑（武汉卡五星基础规则）
- 胡牌 3D 表现动画
- 结算界面占位
- 亮牌胡牌翻倍

**产出：** 胡牌判定和结算界面

### 5.6 换牌/退牌实现

**目标：** 实现换牌和退牌的交互

**任务：**
- 换牌请求：质疑换牌 (+6)、尝试换牌 (-5)、换牌被发现额外 (-5)
- 退牌：要求必须退原牌 (+10)
- 换牌 UI 流程

**产出：** 换牌/退牌 UI 和逻辑

**Phase 5 依赖关系：**
```
5.1 漏牌 ──┐
5.2 撤回 ──┤
5.3 催促 ──┼── (相互独立，可并行)
5.4 亮牌 ──┤
5.5 胡牌 ──┤
5.6 换牌 ──┘
```

---

## Phase 6: 后端基础设施 + 联调

> 对应 CLAUDE.md 步骤 21-33

### 6.1 Spring WebSocket + STOMP

**目标：** 实现后端 WebSocket 通信

**任务：**
- 配置 WebSocketConfig（STOMP 协议）
- 实现 GameSocketController — 接收 ClientAction
- 实现 GameMessagePublisher — 广播 GameEvent
- 实现 WebSocketSessionRegistry — 会话管理
- 路径配置：/app/game/action、/topic/room/{roomId}、/user/queue/private

**产出：** `websocket/` 包完整实现

### 6.2 Redis 房间状态

**目标：** 使用 Redis 存储实时房间状态

**任务：**
- 配置 RedisConfig
- 实现 RoomStateRedisRepository — 房间状态读写
- 实现 GameLockService — 分布式锁
- Redis key 命名规范：
  - kwx:room:main:state
  - kwx:room:main:queue
  - kwx:player:{playerId}:session
  - kwx:game:{gameId}:state
  - kwx:game:{gameId}:lock
  - kwx:action:{actionId}

**产出：** `redis/` 包完整实现

### 6.3 后端游戏核心

**目标：** 将 LocalMockServer 的逻辑迁移到后端

**任务：**
- 实现 GameCore 状态机
- 实现房间管理：单房间、排队、AI 补位
- 实现玩家加入/离开/排队
- AI 补位：真人不足时 AI 补满，真人加入替换 AI，真人离开 AI 接管
- 所有 action 必须加锁处理

**产出：** `game/core/` 和 `game/room/` 包

### 6.4 MySQL 持久化

**目标：** 实现基础数据持久化

**任务：**
- 配置 MySQL 数据源
- 创建基础表：
  - player_guest（游客信息）
  - game_record（牌局记录）
  - game_round_record（每轮记录）
  - behavior_score_log（行为分日志）
  - asset_record（资源记录）
- 实现 MyBatis Mapper

**产出：** `persistence/` 包和 SQL 脚本

### 6.5 OSS 服务封装

**目标：** 封装阿里云 OSS 服务

**任务：**
- 配置 OssConfig
- 实现 OssService — 上传/下载/签名 URL
- 第一阶段可使用本地静态资源
- 禁止业务代码直接依赖 OSS SDK

**产出：** `oss/` 包

### 6.6 前端切换 SocketTransport

**目标：** 前端从 LocalTransport 切换到 SocketTransport

**任务：**
- 实现 SocketTransport — 连接 Spring WebSocket
- 通过 GameTransport 接口切换
- 确保所有 action/event 通过 WebSocket 传输
- 行为分、运势、漏牌等算法在后端执行

**产出：** `packages/web-core/src/transport/socket-transport.ts`

### 6.7 CORS 配置

**目标：** 配置跨域

**任务：**
- 实现 CorsConfig
- 允许前端开发服务器访问

**产出：** `config/CorsConfig.java`

### 6.8 集成测试

**目标：** 前后端联调通过

**任务：**
- 前端连接后端 WebSocket
- 完整游戏流程测试：加入房间 → 发牌 → 摸牌 → 出牌 → 碰/杠/胡
- AI 补位测试
- 真人加入/离开测试
- 行为分变化验证
- 漏牌事件验证

**Phase 6 依赖关系：**
```
6.1 WebSocket ──┐
6.2 Redis     ──┼── 6.3 游戏核心 ── 6.6 SocketTransport ── 6.8 集成测试
6.4 MySQL     ──┤
6.5 OSS       ──┘
6.7 CORS ── (独立)
```

---

## 开发顺序总览

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5 ──→ Phase 6
脚手架       规则算法     传输+AI      UI+3D       动作系统     后端+联调
协议定义                                            基础流程
```

## 关键约束提醒

1. **规则和表现分离** — Three.js 只负责表现，Spring Boot 负责权威规则
2. **统一传输接口** — LocalTransport 和 SocketTransport 实现同一 GameTransport
3. **AI 通过 ClientAction** — AI 禁止直接修改 GameState
4. **协议同步** — Java DTO、TS 类型、Zod schema、protocol.md 四份必须一致
5. **测试先行** — 核心规则必须有测试才能修改
6. **3D 世界坐标** — 禁止屏幕坐标判断，必须用 Raycaster
7. **单一房间** — 第一阶段只做一个房间
8. **手机优先** — UI 和交互以手机浏览器为首要目标
