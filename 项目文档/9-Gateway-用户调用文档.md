# Gateway 用户调用文档

OptRouter Gateway 是一个 **OpenAI 兼容**的 AI 网关，支持多 Provider 路由、自动成本优化和用量计费。

> **接入零成本**：只需把 `base_url` 从 `https://api.openai.com/v1` 改成网关地址，其余代码不用改。

---

## 目录

1. [快速开始](#1-快速开始)
2. [鉴权](#2-鉴权)
3. [接口列表](#3-接口列表)
4. [对话接口详解](#4-对话接口详解)
5. [OptRouter 智能路由](#5-optrouter-智能路由)
6. [代码示例](#6-代码示例)
7. [错误处理](#7-错误处理)
8. [响应头说明](#8-响应头说明)

---

## 1. 快速开始

**网关地址**

| 环境 | 地址 |
|---|---|
| 本地开发 | `http://localhost:9115` |
| 生产环境 | 联系管理员获取域名 |

**最简示例（curl）**

```bash
curl -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-你的ApiKey" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

---

## 2. 鉴权

所有接口均需在 Header 中携带 API Key：

```
Authorization: Bearer sk-xxxxxxxxxxxxxxxx
```

API Key 在控制台的 **API 密钥** 页面创建，格式为 `sk-` 开头的字符串。Key 只显示一次，请妥善保存。

**鉴权失败时的响应：**

```json
{"error": {"message": "missing or invalid api key", "type": "authentication_error"}}
```

---

## 3. 接口列表

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/v1/chat/completions` | 对话补全（核心接口）|
| `GET` | `/v1/models` | 获取可用模型列表 |
| `GET` | `/v1/models/{model}/pricing` | 查询指定模型单价 |
| `GET` | `/health` | 网关健康检查 |

---

## 4. 对话接口详解

### `POST /v1/chat/completions`

#### 请求参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `model` | string | ✅ | 模型名，支持物理模型和[虚拟档位](#5-optrouter-智能路由) |
| `messages` | array | ✅ | 对话消息，元素包含 `role` 和 `content` |
| `stream` | boolean | | `true` = 流式 SSE；`false` = 完整 JSON（默认） |
| `temperature` | float | | 生成随机性，0 ~ 2 |
| `max_tokens` | integer | | 最大输出 token 数 |
| `top_p` | float | | nucleus sampling 参数 |
| `stop` | array | | 停止词列表 |
| `presence_penalty` | float | | 话题新鲜度惩罚 |
| `frequency_penalty` | float | | 重复惩罚 |

`messages` 中 `role` 支持：`system` / `user` / `assistant`

#### 非流式响应

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1741234567,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！有什么可以帮你的？"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 18,
    "total_tokens": 30
  }
}
```

#### 流式响应（`stream: true`）

每行格式为 `data: {...JSON...}`，最后以 `data: [DONE]` 结束：

```
data: {"id":"chatcmpl-abc123","choices":[{"delta":{"role":"assistant"},"index":0}]}

data: {"id":"chatcmpl-abc123","choices":[{"delta":{"content":"你好"},"index":0}]}

data: {"id":"chatcmpl-abc123","choices":[{"delta":{"content":"！"},"index":0}]}

data: [DONE]
```

---

## 5. OptRouter 智能路由

这是网关的核心差异化功能：**自动把请求路由到最合适（且最便宜）的模型**，无需手动指定。

### 开启方式

有两种方式开启智能路由，任选其一：

#### 方式 A：使用虚拟模型名（推荐）

直接把 `model` 字段设置为档位名，系统自动选取该档位下价格最优的物理模型：

| 虚拟模型名 | 适用场景 | 典型路由目标 |
|---|---|---|
| `eco` | 简单问答、打招呼、查基础事实 | gpt-4o-mini 等低价模型 |
| `balanced` | 日常对话、通用文本处理 | 中等模型 |
| `premium` | 复杂逻辑、创意写作、高风险任务 | gpt-4o 等顶配模型 |
| `code` | 编程、调试、SQL/JSON 构造 | 代码专用模型 |
| `reasoning` | 数学推导、多步逻辑、深度分析 | 推理增强模型 |
| `longctx` | 超长文档、需要记住大量历史的任务 | 大上下文模型 |
| `auto` | 不确定时让系统自动判断 | 由内容特征决定 |

```bash
# 示例：请求 eco 档位，系统自动路由到低价模型
curl -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-你的ApiKey" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "eco",
    "messages": [{"role": "user", "content": "1+1等于几"}]
  }'
```

#### 方式 B：保留原模型名 + 显式 Header

当你已有业务代码、不想改 `model` 字段时，加一个 Header 让网关自动判断是否可以降级节省成本：

```
X-Opt-Strategy: intelligent
```

```bash
# 示例：请求 gpt-4o，但允许网关在任务简单时降级到 mini
curl -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-你的ApiKey" \
  -H "X-Opt-Strategy: intelligent" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "讲个三个字的冷笑话"}]
  }'
```

### 会话记忆（可选）

携带 `X-Session-Id` Header 可以让网关记住本次对话的上下文（话题、任务类型等），在后续轮次中做出更精准的路由决策：

```
X-Session-Id: 你的会话UUID（如 550e8400-e29b-41d4-a716-446655440000）
```

同一个用户会话保持相同的 `X-Session-Id`，网关会在每次响应后异步更新会话摘要，下一轮路由时自动读取。

> Session ID 必须是合法的 UUID 格式，可用 `uuidgen`（macOS/Linux）生成。

### 智能路由三层决策

```
请求进入
   ↓
Layer 1：启发式规则（毫秒级）
   消息长度、代码特征、意图关键词 → 打分选档位
   ↓ 置信度不足
Layer 2：上下文感知（毫秒级）
   读取 Redis 会话摘要（历史话题/目标）→ 锁定档位
   ↓ 仍然不足
Layer 3：小模型复判（限时 2s）
   调用 gpt-4o-mini 分类当前意图 → 最终决策
```

---

## 6. 代码示例

### Python（OpenAI SDK）

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-你的ApiKey",
    base_url="http://localhost:9115/v1"
)

# 普通调用
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好"}]
)
print(response.choices[0].message.content)
```

**使用智能路由（虚拟档位）：**

```python
# 自动选择最省钱的模型来完成简单任务
response = client.chat.completions.create(
    model="eco",   # 也可以用 "auto" / "code" / "premium" 等
    messages=[{"role": "user", "content": "把这段话翻译成英文：今天天气不错"}]
)
print(response.choices[0].message.content)
print("实际使用模型:", response.model)
```

**流式调用：**

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一首关于秋天的诗"}],
    stream=True
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

**带会话记忆的智能路由：**

```python
import uuid
from openai import OpenAI

client = OpenAI(api_key="sk-你的ApiKey", base_url="http://localhost:9115/v1")
session_id = str(uuid.uuid4())  # 同一会话保持不变

def chat(user_message: str) -> str:
    response = client.chat.completions.create(
        model="auto",
        messages=[{"role": "user", "content": user_message}],
        extra_headers={"X-Session-Id": session_id}
    )
    return response.choices[0].message.content

print(chat("帮我写一个 Python 快速排序"))
print(chat("再加上单元测试"))   # 网关记住上下文，继续用 code 档位
```

---

### JavaScript / TypeScript

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-你的ApiKey",
  baseURL: "http://localhost:9115/v1",
});

// 普通非流式调用
const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "你好" }],
});
console.log(response.choices[0].message.content);

// 智能路由 + 流式
const stream = await client.chat.completions.create({
  model: "auto",
  messages: [{ role: "user", content: "用 Rust 写一个 HTTP Server" }],
  stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

---

### curl

**非流式：**

```bash
curl -s -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-你的ApiKey" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "你好"}]
  }' | jq '.choices[0].message.content'
```

**流式（实时输出）：**

```bash

curl -N -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-mm61wdhk-2fcvs5uq9he" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "premium",
    "messages": [{"role": "user", "content": "讲一个故事"}],
    "stream": true
  }'


```

**【这个是重点要测多个档位】智能路由（eco  档位）：**

```bash

curl -s -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-mm61wdhk-2fcvs5uq9he" \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: $(uuidgen)" \
  -d '{
    "model": "eco",
    "messages": [{"role": "user", "content": "1+1等于几"}]
  }' | jq '{model: .model, answer: .choices[0].message.content}'


```

---

### 查询可用模型

```bash
curl -s http://localhost:9115/v1/models \
  -H "Authorization: Bearer sk-你的ApiKey" | jq '.data[].id'
```

### 查询模型单价

```bash
curl -s http://localhost:9115/v1/models/gpt-4o/pricing \
  -H "Authorization: Bearer sk-你的ApiKey"
```

响应示例：
```json
{
  "model_name": "gpt-4o",
  "input_cost": 0.0025,
  "output_cost": 0.01,
  "provider": "openai"
}
```

---

## 7. 错误处理

所有错误均以 OpenAI 兼容格式返回：

```json
{
  "error": {
    "message": "具体错误信息",
    "type": "错误类型"
  }
}
```

| HTTP 状态码 | type | 含义及处理方式 |
|---|---|---|
| `401` | `authentication_error` | API Key 缺失或无效，检查 Key 格式和有效性 |
| `403` | `authorization_error` | Key 已禁用或过期，在控制台重新生成 |
| `400` | `invalid_request_error` | 请求参数错误（如 model 为空、messages 为空）|
| `402` | `insufficient_balance` | 余额不足，充值后重试 |
| `429` | `rate_limit_error` | 触发限流，稍等片刻后重试 |
| `502` | `upstream_error` | 上游 Provider 返回错误，可稍后重试 |
| `500` | `internal_error` | 网关内部错误，请联系管理员 |

**建议的重试策略（针对 429/502）：**

```python
import time

def chat_with_retry(client, **kwargs):
    for attempt in range(3):
        try:
            return client.chat.completions.create(**kwargs)
        except Exception as e:
            if attempt == 2:
                raise
            wait = 2 ** attempt   # 1s, 2s, 4s 指数退避
            time.sleep(wait)
```

---

## 8. 响应头说明

非流式请求成功时，响应会附带以下自定义 Header：

| Header | 说明 |
|---|---|
| `X-Model-Latency-Ms` | 端到端延迟（毫秒），含网络 + 模型生成时间 |
| `X-Cost-Yuan` | 本次调用费用（元），精确到小数点后 6 位 |

```bash
# 查看响应头
curl -i -X POST http://localhost:9115/v1/chat/completions \
  -H "Authorization: Bearer sk-你的ApiKey" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}]}'

# 输出中会包含：
# X-Model-Latency-Ms: 1234
# X-Cost-Yuan: 0.000125
```