# OptRouter 订阅·绑卡·支付与 PayRouter 联调说明

| 项目 | 说明 |
|------|------|
| **文档版本** | v1.0（架构 + 联调合并版） |
| **日期** | 2026-05-20 |
| **读者** | PayRouter / OptRouter / 产品 |
| **关联文档** | [12-计费设计说明](./12-计费设计说明.md)、[33-商业化产品优化实施清单](./33-商业化产品优化实施清单.md) |
| **业务系统** | OptRouter（`app_id`：`optrouter`） |

> 原 `34-订阅与支付架构说明`、`35-OptRouter与PayRouter订阅绑卡联调开发流程` 已合并为本文件。  
> **35 号文件仅保留跳转说明。**

---

## 目录

- [一、核心结论](#一核心结论)
- [二、系统边界](#二系统边界)
- [三、两条业务线](#三两条业务线)
- [四、绑卡](#四绑卡)
- [五、渠道策略](#五渠道策略)
- [六、OptRouter 现状与缺口](#六optrouter-现状与缺口)
- [七、PayRouter 评审结论](#七payrouter-评审结论)
- [八、主链路与 Webhook 分流](#八主链路与-webhook-分流)
- [九、PayRouter 侧数据表](#九payrouter-侧数据表)
- [十、应该先改谁？](#十应该先改-payrouter-还是-optrouter)
- [十一、分期开发计划](#十一分期开发计划)
- [十二、PayRouter API 契约](#十二payrouter-api-契约)
- [十三、Billing Webhook](#十三billing-webhook)
- [十四、Stripe 配置](#十四stripe-配置)
- [十五、OptRouter 对接](#十五optrouter-对接)
- [十六、数据映射与幂等](#十六数据映射与幂等)
- [十七、联调测试](#十七联调测试)
- [十八、评审确认项](#十八评审确认项)
- [十九、PayRouter P1 任务拆分](#十九payrouter-p1-任务拆分)
- [二十、评审 checklist](#二十评审-checklist)

---

## 一、核心结论

1. **用户只接触 OptRouter**（optrouter.com）；PayRouter 对内，用户不可见。
2. **绑卡与订阅 UI 在 OptRouter**；Stripe Secret 与 Webhook 在 PayRouter。
3. **订阅扣款进平台 Stripe 商户账户**；用户是付款人，非收款方。
4. **国内**微信/支付宝充值为主；**国际** Stripe 绑卡 + 月订阅（一期）。
5. **余额充值与会员订阅是两条线**，不要混账（默认订阅款不入余额）。
6. 今日 PayRouter 的 Stripe 是 **Checkout 跳转**；订阅需 **新建 Billing 域**，不是小改。

---

## 二、系统边界

```text
用户浏览器（仅 optrouter.com）
        │ HTTPS
        ▼
OptRouter（web）
  · 会员/绑卡/订阅 UI · 充值 · Gateway 鉴权
        │ PAYMENT_GATEWAY_* + 签名
        ▼
PayRouter（310-payrouter，对内）
  · /api/v1/pay/orders（已有）· /api/v1/billing/*（新建）
  · Stripe Webhook 中枢 → 分流 → 回调 OptRouter
        │
   微信 / 支付宝 / Stripe（平台商户账户）
```

环境变量：一套 `PAYMENT_GATEWAY_BASE_URL`（**已含 `/api/v1`**）、`API_KEY`、`API_SECRET`、`APP_ID`；渠道由 `pay_provider` 与接口类型区分。

---

## 三、两条业务线

| 维度 | 余额充值（已有） | 会员订阅（新建） |
|------|------------------|------------------|
| PayRouter | `POST /api/v1/pay/orders` | `POST /api/v1/billing/*` |
| OptRouter 回调 | `/api/recharge/notify` | `/api/billing/webhook` |
| Stripe 形态 | Checkout `pay_url` | SetupIntent + Subscription |
| 落库 | `recharge_orders` → 余额 | `subscriptions` → 权益 |
| API 扣费 | 扣 `user_balances` | 按套餐（待产品定） |

---

## 四、绑卡

- 入口：OptRouter 账单/会员页；**订阅场景不跳** Stripe Checkout 整页。
- 前端：Stripe Payment Element + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`。
- 后端：调 PayRouter `setup-intents` 拿 `client_secret`；**不存**完整卡号。
- PayRouter：Customer + SetupIntent（`usage=off_session`）+ default PM。

---

## 五、渠道策略

| 区域 | 充值 | 订阅 |
|------|------|------|
| 国内 | 微信/支付宝 ✅ | 周期代扣 **二期** |
| 国际 | Stripe Checkout ✅ | Stripe 绑卡+订阅 **一期** |

---

## 六、OptRouter 现状与缺口

| 已有 | 待建 |
|------|------|
| `(recharge)/`、`PaymentGatewayClient` | `(billing)/` 模块 |
| `/api/recharge/notify` | `/api/billing/webhook` |
| `plans`、`subscriptions` 表（未接支付） | 绑卡页、会员开通/取消 |
| Stripe 单次 `pay_url` | `client_secret` + Payment Element |

**Prisma 扩展（OptRouter）**：`plans.code`、`subscriptions.gateway_*`、`payment_methods`。

---

## 七、PayRouter 评审结论

| 能力 | 已有 | 新增 |
|------|------|------|
| `/api/v1/pay/orders` + Checkout | ✅ | 保留 |
| MD5 签名 | ✅ | Billing 沿用 |
| recharge notify | ✅ | billing 新 URL + envelope |
| Customer / SetupIntent / Subscription | ❌ | **整块新建** |
| `client_secret` | ❌ | P1 必须 |
| `plan_code → price_id` | ❌ | P0/P2 |
| Webhook 转发订阅事件 | 部分 | 分流 + 扩展 |

- **App**：强烈建议单独 **`optrouter`**（`notifyUrl` + `billing_notify_url` 分开）。
- **Stripe 密钥**：PayRouter 全局一套；非 Connect。
- **禁止**：用 Order SUCCESS 逻辑处理 subscription 事件。

---

## 八、主链路与 Webhook 分流

### 8.1 绑卡

```text
OptRouter → POST /api/v1/billing/setup-intents → client_secret
→ 前端 confirmSetup → Stripe → PayRouter callback
→ POST OptRouter /api/billing/webhook → payment_methods
```

### 8.2 开通订阅

```text
OptRouter → POST /api/v1/billing/subscriptions → Stripe sub_xxx
→ invoice.paid → webhook → subscriptions.active
```

### 8.3 PayRouter 内分流（定稿）

```text
Stripe → POST /api/v1/callback/stripe
  ├─ checkout.* → Order → /api/recharge/notify
  └─ setup_intent.* / subscription.* / invoice.*
        → Billing → billing_event_log → envelope → /api/billing/webhook
```

---

## 九、PayRouter 侧数据表

| 表 | 用途 |
|----|------|
| `billing_customers` | app_id + biz_user_id ↔ cus_xxx |
| `billing_plans` | plan_code ↔ price_id |
| `billing_subscriptions` | sub_xxx 状态 |
| `billing_event_log` | 幂等 |
| `billing_notify_logs` | 转发重试 |

`apps.billing_notify_url`（与 recharge `notifyUrl` 分开）。

实现：**BillingService** + Stripe Billing SDK，不塞进 `create_order`。

---

## 十、应该先改 PayRouter 还是 OptRouter？

**结论：PayRouter 先行（P0→P1→P2），OptRouter 做可并行准备；端到端联调从 PayRouter 接口就绪开始。**

```text
PayRouter P0 ──► PayRouter P1 ──►【联调：绑卡】──► PayRouter P2 ──►【联调：订阅】──► OptRouter Gateway 权益
     │                │                              │
     └─ OptRouter 可并行：Prisma、(billing) 骨架、webhook 空实现、配 pk_
```

| 顺序 | 负责方 | 内容 | 说明 |
|------|--------|------|------|
| **1** | **PayRouter** | P0：App `optrouter`、表结构、`billing_plans`、Webhook 分流骨架 | 无 API 则 OptRouter 只能 mock |
| **2** | **PayRouter** | P1：customers、setup-intents、payment-methods、绑卡 webhook 转发 | **阻塞绑卡联调** |
| **3** | OptRouter（并行） | Prisma 迁移、`(billing)/domain`、webhook route、`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 不依赖 P1 可先写代码 |
| **4** | **双方** | 联调绑卡 E2E | |
| **5** | **PayRouter** | P2：subscriptions CRUD、全量 webhook、重试队列 | **阻塞订阅联调** |
| **6** | OptRouter | 会员页、开通/取消、处理 billing webhook | |
| **7** | **双方** | 联调订阅 E2E | |
| **8** | OptRouter | Gateway 与 `past_due`（产品规则后） | 可最晚 |

**不要**：PayRouter P1 未完成就投入 OptRouter 绑卡页真联调。  
**不要**：OptRouter 直连 Stripe Secret / Webhook。

---

## 十一、分期开发计划

### P0（0.5 周）

| PayRouter | OptRouter（并行） |
|-----------|-------------------|
| App `optrouter`、`billing_plans`、表迁移 | `PAYMENT_GATEWAY_*`、`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Stripe whsec、Live/Test 两套 price_id | Prisma：`plans.code`、`gateway_*`、`payment_methods` |

### P1（PayRouter 1～1.5 周）

PayRouter：`/billing/customers`、`setup-intents`、`payment-methods`、绑卡 webhook。  
OptRouter：绑卡页、`POST /api/billing/setup-intent`、`POST /api/billing/webhook`（绑卡事件）。

### P2（PayRouter 1.5～2 周）

PayRouter：subscriptions CRUD、续费/失败 webhook、**重试监控**。  
OptRouter：会员页、订阅 API、webhook 全事件。

### P3（0.5 周）

生产、对账、告警；OptRouter Gateway 权益（可选）。

---

## 十二、PayRouter API 契约

- 路径：`/api/v1/billing/...`
- 认证：`X-Api-Key` + MD5（GET body 为空字符串）
- `biz_user_id`：OptRouter `users.id`
- `app_id`：body 可选，须与 ApiKey 所属 App 一致
- `gateway_subscription_id`：**Stripe `sub_xxx`**
- 错误：`{ code, message, detail }`

| 方法 | 路径 |
|------|------|
| POST | `/api/v1/billing/customers` |
| POST | `/api/v1/billing/setup-intents`（`usage: off_session`） |
| GET | `/api/v1/billing/payment-methods?biz_user_id=` |
| POST | `/api/v1/billing/subscriptions`（`plan_code`，PayRouter 映射 price_id） |
| PATCH | `/api/v1/billing/subscriptions/{sub_xxx}` |
| DELETE | `/api/v1/billing/subscriptions/{sub_xxx}?cancel_at_period_end=true` |
| GET | `/api/v1/billing/subscriptions/{sub_xxx}` |

**SetupIntent 响应**：`client_secret`、`customer_id`（`publishable_key` 由 OptRouter 环境变量配置）。

**订阅错误码**：`NO_PAYMENT_METHOD`、`INVALID_PLAN`、`SUBSCRIPTION_EXISTS`、`PAYMENT_FAILED`。

### 附录 A：请求/响应示例（完整）

#### A.1 POST /api/v1/billing/customers

```http
POST /api/v1/billing/customers
Content-Type: application/json
X-Api-Key: {api_key}
X-Timestamp: {unix_seconds}
X-Nonce: {random}
X-Sign: {md5}

{
  "biz_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "optional",
  "app_id": "optrouter"
}
```

```json
{
  "customer_id": "cus_xxx",
  "biz_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created": true
}
```

#### A.2 POST /api/v1/billing/setup-intents

```json
// 请求
{ "biz_user_id": "550e8400-e29b-41d4-a716-446655440000", "usage": "off_session" }

// 响应
{
  "setup_intent_id": "seti_xxx",
  "client_secret": "seti_xxx_secret_xxx",
  "customer_id": "cus_xxx"
}
```

#### A.3 POST /api/v1/billing/subscriptions

```json
// 请求
{
  "biz_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "plan_code": "pro_monthly",
  "payment_method_id": "pm_xxx",
  "idempotency_key": "sub-create-550e8400-pro_monthly-20260520"
}

// 响应
{
  "gateway_subscription_id": "sub_xxx",
  "customer_id": "cus_xxx",
  "status": "active",
  "plan_code": "pro_monthly",
  "current_period_start": "2026-05-20T08:00:00Z",
  "current_period_end": "2026-06-20T08:00:00Z",
  "cancel_at_period_end": false
}
```

#### A.4 Billing Webhook envelope

```json
{
  "event_id": "evt_payrouter_unique_id",
  "event_type": "subscription.renewed",
  "app_id": "optrouter",
  "biz_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "occurred_at": "2026-05-20T10:00:00Z",
  "data": {
    "gateway_subscription_id": "sub_xxx",
    "gateway_customer_id": "cus_xxx",
    "plan_code": "pro_monthly",
    "status": "active",
    "current_period_end": "2026-06-20T08:00:00Z",
    "amount": 29.0,
    "currency": "USD",
    "invoice_id": "in_xxx",
    "stripe_event_id": "evt_xxx"
  },
  "sign": "..."
}
```

---

## 十三、Billing Webhook

| 环境 | URL |
|------|-----|
| 生产 | `https://optrouter.com/api/billing/webhook` |
| 测试 | `{NEXT_PUBLIC_BASE_URL}/api/billing/webhook` |

配置：PayRouter `apps.billing_notify_url`（按 `app_id`）。

验签：与 recharge 相同（`verifyNotifySign`）；失败仍 HTTP 200。

**event_type**：`payment_method.attached`、`subscription.created`、`subscription.renewed`、`subscription.payment_failed`、`subscription.updated`、`subscription.canceled`。

Envelope 含 `event_id`（幂等）、`biz_user_id`、`data.gateway_subscription_id`、`data.stripe_event_id` 等。

---

## 十四、Stripe 配置

- Webhook **只指向 PayRouter**；事件含 setup_intent、subscription、invoice。
- `plan_code`：`pro_monthly` / `pro_yearly` → PayRouter `billing_plans`。
- Customer metadata：`app_id`、`biz_user_id`。

---

## 十五、OptRouter 对接

| 路由 | 作用 |
|------|------|
| `POST /api/billing/setup-intent` | 转发 setup-intents |
| `GET /api/billing/payment-methods` | 转发列表 |
| `POST /api/billing/subscriptions` | 开通 |
| `DELETE /api/billing/subscriptions` | 取消 |
| `POST /api/billing/webhook` | PayRouter 调用 |

页面：`/billing/payment-methods`（Elements）、会员/账单 Tab。

客户端：扩展 `web/lib/payment-gateway/client.ts`（与 `createPayOrder` 同签名）。

---

## 十六、数据映射与幂等

| 概念 | OptRouter | PayRouter | Stripe |
|------|-----------|-----------|--------|
| 用户 | `users.id` | `biz_user_id` | metadata |
| 订阅 | `subscriptions.id` | — | `sub_xxx` → `gateway_subscription_id` |
| 套餐 | `plans.code` | `plan_code` | price_id |

幂等：Customer=`biz_user_id+app_id`；订阅=`idempotency_key`；Webhook=`event_id`。

---

## 十七、联调测试

- 绑卡：Customer 幂等、3DS 取消、webhook 重复
- 订阅：无卡 400、409 重复订阅、cancel_at_period_end、Test Clock 续费、past_due
- **隔离**：Checkout 充值仍走 `/api/recharge/notify`；billing 不改余额

---

## 十八、评审确认项（PayRouter 已确认）

| # | 结论 |
|---|------|
| 1 | `/api/v1/billing/...` |
| 2 | MD5 签名沿用 |
| 3 | `pk_` 由 OptRouter 配置 |
| 4 | `billing_notify_url` 按 app_id |
| 5 | `plan_code` PayRouter 映射 |
| 6 | P1 1～1.5 周；P2 1.5～2 周 |
| 7 | 测试 apiKey 同 recharge 发放 |
| 8 | notify_logs 或 billing_notify_logs 重试 ≥24h |

---

## 十九、PayRouter P1 任务拆分

| 模块 | 工作项 |
|------|--------|
| Schema | billing_* 表、apps.billing_notify_url |
| 路由 | customers、setup-intents、payment-methods |
| BillingService | Customer 幂等、off_session、default PM |
| Stripe 回调 | callback/stripe 分流，不走 Order SUCCESS |
| 转发 | envelope + POST OptRouter + 重试 |
| 测试 | Stripe CLI + Checkout 充值回归 |

---

## 二十、评审 checklist

- [ ] 用户 never 访问 PayRouter
- [ ] 绑卡/订阅 UI 在 OptRouter
- [ ] 资金进平台 Stripe 商户
- [ ] 订阅 ≠ 充值入账
- [ ] 订阅用 Payment Element，非 Checkout
- [ ] Webhook 只进 PayRouter 再转发
- [ ] checkout 与 billing 事件分流

---

## 二十一、Stripe 充值体验升级：已绑卡直接扣（P1.5 · 产品定调）

### 21.1 问题

当前 **绑卡（Billing SetupIntent）** 与 **Stripe 充值（Checkout Session）** 是两条线：用户绑卡后点「Stripe 充值」仍会跳转 `checkout.stripe.com`，体验冗余。

**产品定调**：国际用户 **先在账单页绑卡**；之后 Stripe 充值应 **优先用默认卡扣款**，无 Checkout 整页跳转；**未绑卡** 时再引导绑卡或一次性 Checkout。

### 21.2 目标 UX

```text
已绑默认卡：
  充值页选 Stripe + 金额 → 点确认 → 站内 loading → 成功/失败 toast → 余额更新
  （仅 3DS 等必要时弹 Stripe 验证，仍可不离开站内）

未绑卡：
  引导「先去账单绑卡」或「本次用 Checkout 支付」（可选保留）
```

### 21.3 PayRouter 需新增（P1.5）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/billing/charges` | 用已绑卡扣 **单次充值**（非 Subscription） |

**请求示例：**

```json
{
  "biz_user_id": "uuid",
  "biz_order_no": "RECHARGE_xxx",
  "amount": 30,
  "currency": "CNY",
  "payment_method_id": "pm_xxx",
  "idempotency_key": "charge-RECHARGE_xxx",
  "notify_url": "https://optrouter.com/api/recharge/notify"
}
```

**PayRouter 内部：**

- `PaymentIntent.create(customer=..., payment_method=..., amount=..., confirm=true, off_session=true)`
- 若需 3DS：返回 `requires_action` + `client_secret`，OptRouter 前端 `stripe.confirmCardPayment`（仍比 Checkout 轻）
- 成功：走现有 **recharge notify** 入账（或 billing webhook 映射为 recharge 成功，二选一，推荐 **仍 POST `/api/recharge/notify`** 保持入账逻辑不变）

**Webhook：**

- `payment_intent.succeeded` → 若 `metadata.biz_order_no` 存在 → 走 **Order/recharge 入账**，**不要** 与 subscription 混淆

### 21.4 OptRouter 改造（PayRouter P1.5 就绪后）

1. `createRechargeOrderService`：若 `payProvider === 'STRIPE'` 且 DB/`payment-methods` 有 **默认卡** → 调 `/billing/charges`
2. 无默认卡 → 引导绑卡页，或 fallback 现有 Checkout（可配置）
3. 充值页文案：**「已绑卡将直接扣款，无需跳转 Stripe」**
4. **不再** 对已绑卡用户默认走 `pay/orders` + Checkout

### 21.5 与订阅的关系

| 场景 | 扣款方式 |
|------|----------|
| 单次充值 | `/billing/charges` + 已绑 PM |
| 会员订阅 | `/billing/subscriptions`（P2） |
| 首充未绑卡 | SetupIntent 或 Checkout 二选一 |

绑卡 **一次**，充值 + 订阅 **共用** Customer 与 PaymentMethod。

**详细分工与 API 契约（可转发 PayRouter）**：见 [36-Stripe已绑卡直扣充值改造清单-P1.5.md](./36-Stripe已绑卡直扣充值改造清单-P1.5.md)

---

## 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-05-20 | 架构草案（原 34） |
| v0.2 | 2026-05-20 | 联调流程 + PayRouter 评审（原 35） |
| v1.0 | 2026-05-20 | **合并为本文**；新增 §十 改造顺序 |
| v1.1 | 2026-05-25 | §二十一 Stripe 已绑卡直扣（P1.5 产品定调 + PayRouter API 草案） |

---

**当前动作（P1）**：

- PayRouter：P1 已上线（customers / setup-intents / payment-methods + billing webhook 转发）
- OptRouter：已实现 `POST /api/billing/webhook`（**billing 专用验签**）、`setup-intent`、`payment-methods`、账单页绑卡 UI
- 联调前：执行 `npm install @stripe/stripe-js @stripe/react-stripe-js`、Prisma 迁移、配置 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`、确认 PayRouter `billingNotifyUrl` 指向 `http://localhost:3001/api/billing/webhook`（端口与 Next 一致）
