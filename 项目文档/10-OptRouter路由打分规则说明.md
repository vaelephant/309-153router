# OptRouter 路由打分规则说明

> 对应源码：`gateway/src/router/strategy.rs` · `gateway/src/router/types.rs`

---

## 概览：三层决策流水线

```
请求进入
  │
  ▼
Layer 1 — 启发式打分（纯内存，<1ms）
  │  confidence ≥ 0.80 → 直接决策
  │  confidence < 0.80 且有 session →
  ▼
Layer 2 — Session 上下文增强（Redis，~200ms）
  │  confidence ≥ 0.75 → 决策
  │  confidence < 0.75 →
  ▼
Layer 3 — 小模型复判（gpt-4o-mini API，~500ms）
  │  返回档位名（eco/balanced/…）
  ▼
最终档位 → 路由到对应真实模型
```

---

## 档位定义

| 档位 | 适用场景 | 典型模型 |
|------|----------|----------|
| `eco` | 简单问答、打招呼、基础常识 | gpt-4o-mini |
| `balanced` | 通用对话、一般分析、标准任务 | gpt-4o-mini / claude-haiku |
| `premium` | 复杂推理、高质量创作、高风险任务 | gpt-4o / claude-sonnet |
| `code` | 编程、调试、SQL、JSON 结构化任务 | claude-3-5-sonnet |
| `reasoning` | 数学、逻辑推导、深度问题拆解 | o1-mini / deepseek-r1 |
| `longctx` | 超长输入、需要记住大量历史轮次 | gemini-1.5-pro |

---

## Layer 1：启发式打分（HeuristicScorer）

### 初始基础分

| 档位 | 初始分 | 说明 |
|------|--------|------|
| Eco | 1.0 | 默认候选 |
| Balanced | 1.0 | 默认候选 |
| Premium | 0.5 | 略低，需有明确信号才升上来 |
| Code | 0.0 | 无代码信号时不参与竞争 |
| Reasoning | 0.0 | 无推理信号时不参与竞争 |
| LongCtx | 0.0 | 无长文信号时不参与竞争 |

### 规则 1：消息长度

分析对象：**最后一条用户消息**（`messages[-1].content`）的字符数。

| 条件 | 加分 |
|------|------|
| 长度 > 10000 字符 | LongCtx +2.0，Premium +1.0 |
| 长度 > 2000 字符 | Balanced +1.0 |
| 长度 ≤ 2000 字符 | Eco +0.5 |

### 规则 2：代码 / JSON / SQL 检测

分析对象：**最后一条用户消息**的文本内容。

**代码检测**（满足任意一个触发 `has_code = true`）：
- 包含 ` ``` `（Markdown 代码块）
- 包含 `fn `（Rust/其他语言函数）
- 包含 `public class`（Java/C#）
- 包含 `def `（Python）

**JSON 检测**（同时满足触发 `has_json = true`）：
- 包含 `{` 和 `}`
- 包含 `"` 或 `:`

**SQL 检测**（满足任意一个触发 `has_sql = true`，大小写不敏感）：
- 包含 `SELECT `
- 包含 `UPDATE `
- 包含 `INSERT INTO `

| 条件 | 加分 |
|------|------|
| has_code = true | Code +3.0，Premium +1.0 |
| has_json = true 或 has_sql = true | Balanced +1.0，Premium +0.5 |

### 规则 3：对话历史深度

分析对象：`messages` 数组的总长度（含 system/assistant 轮次）。

| 条件 | 加分 |
|------|------|
| 历史轮次 > 15 | LongCtx +1.5，Premium +1.0 |
| 历史轮次 > 5 | Balanced +0.5 |
| 历史轮次 ≤ 5 | 无加分 |

### 规则 4：意图关键词

分析对象：**最后一条用户消息**的小写文本，匹配以下英文词：

| 关键词 | 加分 |
|--------|------|
| `optimize`、`refactor` | Code +1.5，Premium +1.0 |
| `fix`、`analyze` | Premium +1.0，Balanced +0.5 |
| `explain`、`summarize` | Balanced +1.0，Eco +0.5 |

> **注意**：目前只识别英文关键词，中文"优化"、"分析"等不会触发。

### 规则 5：用户显式指定档位

当用户把 `model` 字段设为虚拟档位名（如 `"eco"`、`"code"`）时：

| 条件 | 加分 |
|------|------|
| 指定任意档位 | 对应档位 +10.0 |

+10.0 的压倒性权重确保显式指定一定胜出。

### Layer 1 置信度计算与阈值

```
confidence = max_score / total_score
```

- `max_score`：得分最高档位的分数
- `total_score`：所有档位分数之和

| confidence | 行为 |
|------------|------|
| ≥ 0.80 | Layer 1 直接决策，不进入 Layer 2/3 |
| 用户显式指定 | 无论 confidence，直接决策 |
| < 0.80 | 进入 Layer 2（需要 session_id） |

---

## Layer 2：Session 上下文增强（ContextualRouter）

**触发条件**：请求携带 `X-Session-Id` 头 + Redis 中有该 session 的历史摘要。

在 Layer 1 的得分基础上，叠加以下 session 信号：

| 条件 | 加分 |
|------|------|
| session.task_type == "code" | Code +2.0，Premium +1.0 |
| session.history_depth > 10 | LongCtx +1.0，Premium +0.5 |
| session.preferred_mode 有值 | 对应档位 +2.0 |
| session.risk_level == "high" | Premium +2.0 |

**session 摘要字段说明：**

| 字段 | 可选值 | 含义 |
|------|--------|------|
| `task_type` | chat / code / analysis / writing / planning | 当前会话的任务类型 |
| `risk_level` | low / medium / high | 任务风险等级（high 代表需要高准确性） |
| `history_depth` | 整数 | 历史消息条数 |
| `preferred_mode` | 同档位名 | 会话中用户偏好的模型类型 |

Layer 2 阈值为 **0.75**，confidence ≥ 0.75 时决策，否则进入 Layer 3。

---

## Layer 3：小模型复判（RefinedRouter）

**触发条件**：Layer 1/2 均无法得出 confidence 达标的决策。

发送一次 `gpt-4o-mini` API 调用（最多 10 tokens），Prompt 结构：

```
You are an expert AI router. Classify the user's request into the most appropriate tier.

Available Tiers:
- eco: Simple, short questions, or trivial tasks
- balanced: Standard requests, general analysis, typical chat
- premium: High-quality reasoning, complex creative writing, high-risk tasks
- code: Programming, debugging, SQL/JSON tasks
- reasoning: Deep logical steps, math, intense problem-solving
- longctx: Very long inputs or requires memory of many turns

[Session Context if available]

User Message: "..."

Respond ONLY with the tier name.
```

返回解析规则（按优先级，包含子串即匹配）：
```
eco → Eco
code → Code
reasoning → Reasoning
longctx → LongCtx
premium → Premium
其他 → Balanced（兜底）
```

超时限制：**2 秒**，超时后回退到静态路由（直接按原始模型名查路由表）。

---

## 打分示例

### 示例 1：简单问候

```
model: "auto"
messages: [{"role":"user","content":"你好，今天天气怎么样"}]
```

| 档位 | 初始 | 长度(≤2000→Eco+0.5) | 其他 | 总计 |
|------|------|---------------------|------|------|
| Eco | 1.0 | +0.5 | — | **1.5** |
| Balanced | 1.0 | — | — | 1.0 |
| Premium | 0.5 | — | — | 0.5 |
| Code | 0.0 | — | — | 0.0 |
| Reasoning | 0.0 | — | — | 0.0 |
| LongCtx | 0.0 | — | — | 0.0 |

total = 3.0，confidence = 1.5/3.0 = **0.5** → 低于 0.8，进入 Layer 2 或 Layer 3

> Layer 3 会判定为 eco，最终路由到 gpt-4o-mini。

### 示例 2：代码调试

```
model: "auto"
messages: [{"role":"user","content":"帮我 fix 这段 Python 代码：\n```python\ndef foo():\n  pass\n```"}]
```

| 档位 | 初始 | 长度(≤2000) | has_code | 关键词fix | 总计 |
|------|------|-------------|----------|-----------|------|
| Eco | 1.0 | +0.5 | — | — | 1.5 |
| Balanced | 1.0 | — | — | +0.5 | 1.5 |
| Premium | 0.5 | — | +1.0 | +1.0 | 2.5 |
| Code | 0.0 | — | +3.0 | — | 3.0 |
| Reasoning | 0.0 | — | — | — | 0.0 |
| LongCtx | 0.0 | — | — | — | 0.0 |

total = 8.5，confidence = 3.0/8.5 = **0.353** → 进入 Layer 2/3

> Layer 3 会判定为 code，路由到 claude-3-5-sonnet。

### 示例 3：显式指定档位

```
model: "eco"
messages: [{"role":"user","content":"帮我写一首诗"}]
```

preferred_tier = Eco，Eco +10.0 → confidence 约为 **0.88** → Layer 1 直接决策，路由 Eco 档。

---

## 已知局限

1. **中文意图关键词不识别**：`fix`/`analyze` 等仅匹配英文，"修复"、"分析"不触发加分。
2. **JSON 检测易误判**：消息里含有 `{}`（如描述 JSON 格式）会触发 `has_json`，导致 Balanced 加分。
3. **Layer 3 额外延迟**：每次触发约增加 500-1000ms，建议通过调整 Layer 1 阈值减少触发频率。
4. **历史深度基于消息数量而非 token 数**：system prompt 也算一轮，可能导致 LongCtx 提前触发。


# 打分逻辑写在了哪个代码里

三个文件，各司其职：

## 1
gateway/src/router/types.rs — 特征提取（把原始请求变成可打分的 Profile）

RequestProfile::from_request() 分析最后一条消息，识别 has_code、has_json、has_sql、message_length、intent_keywords
## 2
gateway/src/router/strategy.rs — 打分和决策逻辑

HeuristicScorer::score() — 5 条规则打分，返回各档位分数 Map
CoarseRouter::route() — Layer 1，计算 confidence，≥0.80 决策
ContextualRouter::route() — Layer 2，叠加 session 加分，≥0.75 决策
RefinedRouter::build_prompt() — Layer 3，构造发给 gpt-4o-mini 的 Prompt
## 3
gateway/src/router/model_router.rs — 串联三层的入口

ModelRouter::intelligent_route() — 依次调用 Layer 1 → 2 → 3，返回最终的 RouteInfo