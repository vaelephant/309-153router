import {
  getPaymentGatewayAppId,
  getPaymentGatewayClient,
} from '@/lib/payment-gateway/client'
import { verifyBillingNotifySign } from '@/lib/payment-gateway/billing-notify-signature'
import {
  createBillingWebhookEvent,
  findBillingWebhookEvent,
  listUserPaymentMethods,
  replaceUserPaymentMethods,
} from './billing.repo'
import type { BillingWebhookEnvelope, PaymentMethodView, SetupIntentResult } from './billing.types'

export async function createSetupIntentForUser(
  userId: string,
  options?: { email?: string; name?: string }
): Promise<SetupIntentResult> {
  const client = getPaymentGatewayClient()
  const appId = getPaymentGatewayAppId()
  const res = await client.createSetupIntent({
    bizUserId: userId,
    email: options?.email,
    name: options?.name,
    appId,
  })
  return {
    clientSecret: res.client_secret,
    setupIntentId: res.setup_intent_id,
    customerId: res.customer_id,
  }
}

export async function syncPaymentMethodsFromGateway(userId: string): Promise<void> {
  const client = getPaymentGatewayClient()
  const res = await client.listPaymentMethods(userId)
  await replaceUserPaymentMethods(
    userId,
    res.items.map((item) => ({
      gatewayPmId: item.payment_method_id,
      gatewayCustomerId: res.customer_id,
      brand: item.brand ?? null,
      last4: item.last4 ?? null,
      expMonth: item.exp_month ?? null,
      expYear: item.exp_year ?? null,
      isDefault: Boolean(item.is_default),
    }))
  )
}

export async function getPaymentMethodsForUser(userId: string): Promise<PaymentMethodView[]> {
  try {
    await syncPaymentMethodsFromGateway(userId)
  } catch (error) {
    console.warn('从 PayRouter 同步支付方式失败，使用本地缓存:', error)
  }
  const rows = await listUserPaymentMethods(userId)
  return rows.map((row) => ({
    id: row.id,
    paymentMethodId: row.gatewayPmId,
    brand: row.brand,
    last4: row.last4,
    expMonth: row.expMonth,
    expYear: row.expYear,
    isDefault: row.isDefault,
  }))
}

export async function handleBillingWebhook(
  envelope: BillingWebhookEnvelope
): Promise<{ ok: boolean; error?: string }> {
  try {
    const apiSecret = process.env.PAYMENT_GATEWAY_API_SECRET
    if (!apiSecret) {
      return { ok: false, error: 'PAYMENT_GATEWAY_API_SECRET 未配置' }
    }

    verifyBillingNotifySign(apiSecret, envelope as unknown as Record<string, unknown>, envelope.sign)

    const existing = await findBillingWebhookEvent(envelope.event_id)
    if (existing) {
      return { ok: true }
    }

    const userId = envelope.biz_user_id

    switch (envelope.event_type) {
      case 'payment_method.attached':
        await syncPaymentMethodsFromGateway(userId)
        break
      case 'subscription.created':
      case 'subscription.renewed':
      case 'subscription.payment_failed':
      case 'subscription.updated':
      case 'subscription.canceled':
        // P2：更新 subscriptions 表
        console.info(`Billing webhook 已接收（P2 待实现）: ${envelope.event_type}`, envelope.data)
        break
      default:
        console.info(`未处理的 Billing 事件: ${envelope.event_type}`)
    }

    await createBillingWebhookEvent(envelope.event_id, envelope.event_type)
    return { ok: true }
  } catch (error) {
    console.error('Billing webhook 处理失败:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : '处理失败',
    }
  }
}
