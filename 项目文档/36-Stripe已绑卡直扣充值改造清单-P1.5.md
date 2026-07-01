# Stripe 已绑卡直扣充值 — PayRouter / OptRouter 改造清单（P1.5）

| 项目 | 说明 |
|------|------|
| **版本** | v1.0 |
| **日期** | 2026-05-25 |
| **背景** | P1 已支持绑卡（SetupIntent）；Stripe **充值**仍走 Checkout 跳转，体验冗余 |
| **目标** | 用户 **账单页绑卡一次** 后，充值页选 Stripe **站内直接扣默认卡**，不再跳 `checkout.stripe.com` |
| **关联** | [34-订阅绑卡支付与PayRouter联调说明](./34-订阅绑卡支付与PayRouter联调说明.md) §二十一 |

---

## 一、产品行为（双方对齐）

### 1.1 用户流程

```text
【首次】账单页绑卡（已有 P1）→ payment_methods 有默认卡

【之后每次充值】
  充值页：选 Stripe + 金额（≥ ¥30 / Stripe 最低约 $4 等值）
    → 点「确认充值」
    → OptRouter 调 PayRouter /billing/charges
    → 成功：站内 toast，余额更新（notify 入账）
    → 若 3DS：返回 client_secret，站内 confirmCardPayment（不跳 Checkout 整页）
    → 失败：toast 错误信息

【未绑卡】
  充值页提示「请先在账单绑定银行卡」+ 链接 /billing
  （可选兜底：仍允许走 Checkout /pay/orders，产品可关）
```

### 1.2 不变的部分

| 项 | 说明 |
|----|------|
| 微信 / 支付宝充值 | 仍走 `/pay/orders`，不改 |
| 绑卡 API | 仍用 P1：`/billing/setup-intents` 等 |
| 入账逻辑 | 仍 **`POST OptRouter /api/recharge/notify`** + 现有 `recharge_orders` / 余额 |
| Stripe 密钥 | 仍 PayRouter 全局 `sk_`；OptRouter 仅 `pk_` |
| 订阅 P2 | 仍独立 `/billing/subscriptions`，与本需求并行 |

### 1.3 与 Checkout 的关系

| 场景 | 接口 |
|------|------|
| **已绑卡 + Stripe 充值（本需求）** | `POST /billing/charges` |
| **未绑卡（可选兜底）** | `POST /pay/orders` + Checkout |
| **会员订阅（P2）** | `POST /billing/subscriptions` |

---

## 二、PayRouter 改造清单

> 仓库：`310-payrouter`  
> 依赖：P1 已完成（Customer、SetupIntent、payment-methods、billing webhook 分流）

### 2.1 新增 API

#### `POST /api/v1/billing/charges`

**用途**：对已绑定 PaymentMethod 发起 **单次扣款**（充值，非 Subscription）。

**认证**：与现有一致 — `X-Api-Key` + MD5 签名。

**请求 Body：**

```json
{
  "biz_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "biz_order_no": "RECHARGE_1779705006834_S37GA1",
  "amount": 30,
  "currency": "CNY",
  "payment_method_id": "pm_xxx",
  "idempotency_key": "charge-RECHARGE_1779705006834_S37GA1",
  "notify_url": "http://localhost:3000/api/recharge/notify",
  "title": "账户充值 - ¥30",
  "app_id": "exam_system"
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `biz_user_id` | 是 | OptRouter `users.id` |
| `biz_order_no` | 是 | 与 OptRouter `recharge_orders.biz_order_no` 一致 |
| `amount` | 是 | 元，>0；需满足 Stripe 最低约 $4 等值 |
| `currency` | 否 | 默认 `CNY` |
| `payment_method_id` | 否 | 不传则用 Customer **默认 PM** |
| `idempotency_key` | 推荐 | 幂等 |
| `notify_url` | 是 | 成功/失败后回调 OptRouter（**复用 recharge notify**） |
| `title` | 否 | 展示用 |
| `app_id` | 否 | 须与 ApiKey 所属 App 一致 |

**响应 200 — 扣款已成功：**

```json
{
  "status": "succeeded",
  "gateway_order_no": "GW_xxx",
  "payment_intent_id": "pi_xxx",
  "biz_order_no": "RECHARGE_xxx",
  "amount": 30,
  "currency": "CNY"
}
```

**响应 200 — 需 3DS（前端确认）：**

```json
{
  "status": "requires_action",
  "payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_xxx",
  "biz_order_no": "RECHARGE_xxx"
}
```

**错误码建议：**

| HTTP | code | 含义 |
|------|------|------|
| 400 | `NO_PAYMENT_METHOD` | 无 PM 且 Customer 无默认卡 |
| 400 | `NO_CUSTOMER` | biz_user_id 未绑过卡 |
| 402 | `PAYMENT_FAILED` | 卡拒付等 |
| 409 | `DUPLICATE_ORDER` | biz_order_no 重复 |

---

### 2.2 Stripe 实现要点

**文件建议（在 P1 基础上扩展）：**

| 模块 | 工作 |
|------|------|
| `app/adapters/stripe_billing_adapter.py` | 新增 `create_payment_intent_charge(...)` |
| `app/services/billing_service.py` | 新增 `create_charge(...)`：查 Customer、PM、调 Stripe |
| `app/api/v1/billing.py` | 注册 `POST /billing/charges` |
| `app/schemas/billing_schema.py` | `BillingChargeCreate` 等 |

**Stripe 调用（示意）：**

```python
stripe.PaymentIntent.create(
    amount=unit_amount,           # 分
    currency="cny",
    customer=customer_id,
    payment_method=pm_id,
    confirm=True,
    off_session=True,
    metadata={
        "app_id": app_id,
        "biz_user_id": biz_user_id,
        "biz_order_no": biz_order_no,
        "purpose": "recharge",    # 区分 subscription
    },
    idempotency_key=idempotency_key,
)
```

- 若返回 `requires_action`：原样把 `client_secret` 给 OptRouter
- 若 `succeeded`：触发 notify（见下）

---

### 2.3 订单与 notify（推荐方案）

**推荐**：charges 仍写入 PayRouter **现有 orders 表**（或等价），`pay_provider=STRIPE`，`pay_method=BILLING`（或 `SAVED_CARD`），便于对账。

**成功 / 异步成功路径：**

1. `payment_intent.succeeded`（Stripe Webhook → PayRouter）
2. PayRouter 识别 `metadata.purpose=recharge` + `metadata.biz_order_no`
3. **POST `notify_url`**，Body 与现有 recharge notify **格式一致**：

```json
{
  "biz_order_no": "RECHARGE_xxx",
  "gateway_order_no": "GW_xxx",
  "status": "SUCCESS",
  "amount": 30,
  "sign": "..."
}
```

（签名算法：**现有扁平 notify sign**，与 billing envelope **不同**）

**Webhook 分流（扩展 P1）：**

```text
/api/v1/callback/stripe
  ├─ checkout.*              → 现有 Order（Checkout 充值兜底）
  ├─ payment_intent.succeeded + metadata.purpose=recharge → recharge notify
  └─ setup_intent.* / subscription.* / invoice.*         → Billing 模块（P1/P2）
```

**禁止**：recharge 的 PI 成功事件误走 subscription 逻辑。

---

### 2.4 数据库（可选）

| 表/字段 | 说明 |
|---------|------|
| `orders` | 存 charge 订单；`provider_trade_no` = `pi_xxx` |
| 或 `billing_charges` | 若不想混 orders，单独表 + 仍 notify recharge |

无强制新表，与现有 orders 复用即可。

---

### 2.5 PayRouter 验收标准

- [ ] 已绑卡用户：`POST /billing/charges` 返回 `succeeded` 或 `requires_action`
- [ ] 成功后 OptRouter 收到 `/api/recharge/notify`，余额增加
- [ ] 未绑卡：返回 `NO_CUSTOMER` / `NO_PAYMENT_METHOD`
- [ ] 同一 `biz_order_no` 幂等
- [ ] Checkout 充值（`/pay/orders`）仍可用，互不影响
- [ ] `payment_intent.succeeded`（recharge）与 billing 订阅事件分流正确
- [ ] 单元测试 + Stripe CLI 联调

---

### 2.6 PayRouter 工期建议

**约 3～5 个工作日**（在 P1 已稳定前提下），可与 P2 订阅并行，**建议先于 P2 上线**（用户充值体验优先）。

---

## 三、OptRouter 改造清单

> 仓库：`309-153router` / `web/`

### 3.1 后端

| 文件 | 改动 |
|------|------|
| `lib/payment-gateway/client.ts` | 新增 `createBillingCharge(...)` → `POST /billing/charges` |
| `app/[locale]/(recharge)/domain/recharge.service.ts` | Stripe 分支：有默认卡 → charges；无卡 → 引导或 Checkout 兜底 |
| `app/[locale]/(recharge)/domain/recharge.types.ts` | 扩展返回：`requiresAction` + `clientSecret`（3DS） |
| `app/[locale]/(recharge)/actions.ts` | 透传 3DS 字段给前端（若需要） |

**`createRechargeOrderService` 伪逻辑：**

```text
if payProvider !== 'STRIPE':
  → 现有 /pay/orders（微信/支付宝）

if payProvider === 'STRIPE':
  pm = 查 payment_methods 默认卡（或调 PayRouter list）
  if 无 pm:
    → 返回错误码 NEED_BIND_CARD（前端引导 /billing）
    或 STRIPE_RECHARGE_ALLOW_CHECKOUT=true 时 fallback Checkout

  先 createRechargeOrder(status=pending) 落库
  res = client.createBillingCharge({ bizOrderNo, userId, amount, paymentMethodId, notifyUrl })

  if res.status === 'succeeded':
    → 等 notify 或主动查单（与现有一致）
  if res.status === 'requires_action':
    → 返回 clientSecret 给前端 confirmCardPayment
```

| 环境变量 | 说明 |
|----------|------|
| `STRIPE_RECHARGE_ALLOW_CHECKOUT` | `true` 时未绑卡可走 Checkout；默认 `false` 只引导绑卡 |
| 已有 `PAYMENT_GATEWAY_*`、`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 不变 |

---

### 3.2 前端

| 文件 | 改动 |
|------|------|
| `app/[locale]/(recharge)/components/recharge-form.tsx` | 选 Stripe 时：若已绑卡显示「将直接扣款」；未绑卡显示引导链接 |
| `app/[locale]/(recharge)/recharge/page.tsx` | 处理 `requires_action`：`stripe.confirmCardPayment(clientSecret)` |
| `messages/zh.json` / `en.json` / `ja.json` | 文案：已绑卡直扣、请先绑卡、3DS 确认中等 |

**可选**：充值页加载时 `GET /api/billing/payment-methods` 判断是否已绑卡（已有 API）。

---

### 3.3 入账

- **不改** `handlePaymentNotify` / `processPaymentSuccess` 核心逻辑
- PayRouter notify 仍打 `/api/recharge/notify`
- `billing/webhook` **不** 处理 recharge 入账（避免双通道）

---

### 3.4 OptRouter 验收标准

- [ ] 已绑卡：点充值 **不跳转** checkout.stripe.com
- [ ] 成功后余额更新、充值记录 `paid`
- [ ] 未绑卡：提示去账单绑卡（或 Checkout 兜底可配置）
- [ ] 3DS 测试卡能完成确认
- [ ] 微信/支付宝充值不受影响

---

### 3.5 OptRouter 工期建议

**约 2～3 个工作日**（依赖 PayRouter `/billing/charges` 就绪后联调）。

可 **提前** 做：client 方法、recharge 分支骨架、文案（Mock 404 时 fallback 提示）。

---

## 四、联调步骤

1. PayRouter 部署 `/billing/charges` + webhook 分流  
2. OptRouter 配置 `PAYMENT_GATEWAY_*`，用户已在账单页绑卡  
3. 充值页：Stripe + ¥50 → 确认  
4. 期望：无 Checkout 跳转；notify 入账；`recharge_orders.paid`  
5. Stripe CLI：`payment_intent.succeeded` 进 PayRouter，观察 notify  
6. 回归：微信充值、Checkout 兜底（若开启）、绑卡流程  

---

## 五、分工与优先级

| 顺序 | 负责方 | 交付 |
|------|--------|------|
| 1 | **PayRouter** | `/billing/charges` + PI webhook + recharge notify |
| 2 | **OptRouter** | recharge 分支 + 前端 3DS + 文案 |
| 3 | 双方 | 联调 + 验收 §2.5 / §3.4 |

**优先级**：P1.5（本需求）**建议先于** P2 订阅全量上线。

---

## 六、修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-05-25 | 初稿：PayRouter / OptRouter 分工与 API 契约 |

---

**可直接转发 PayRouter 同学**：重点看 **§二**；OptRouter 同学看 **§三**；产品看 **§一**。
