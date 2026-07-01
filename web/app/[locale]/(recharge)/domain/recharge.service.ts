/**
 * 充值模块业务逻辑层
 */
import { Prisma } from '@prisma/client'
import {
  createRechargeOrder,
  findRechargeOrderById,
  findRechargeOrderByBizOrderNo,
  updateRechargeOrderStatus,
} from './recharge.repo'
import {
  getPaymentGatewayAppId,
  getPaymentGatewayClient,
  PaymentGatewayError,
} from '@/lib/payment-gateway/client'
import { verifyNotifySign } from '@/lib/payment-gateway/notify-signature'
import { prisma } from '@/lib/db'
import { grantInviteRechargeReward } from '../../(invite)/domain/invite.service'
import { getPaymentMethodsForUser } from '../../(billing)/domain/billing.service'
import { RechargeError } from './recharge.errors'
import { notifyRechargeSuccess } from '@/lib/recharge/dingtalk'
import type {
  CreateRechargeOrderParams,
  CreateRechargeOrderResult,
  PaymentNotifyData,
} from './recharge.types'
import {
  payMethodForProvider,
  STRIPE_CHARGE_CURRENCY,
  stripeUsdToCreditCny,
} from './recharge.types'
import { DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n'

/**
 * Stripe Checkout 成功/取消回跳（仅 STRIPE_RECHARGE_ALLOW_CHECKOUT=true 兜底）
 */
function buildStripeCheckoutMeta(locale?: string): Record<string, string> {
  const successOverride = process.env.STRIPE_RECHARGE_SUCCESS_URL?.trim()
  const cancelOverride = process.env.STRIPE_RECHARGE_CANCEL_URL?.trim()
  if (successOverride && cancelOverride) {
    return {
      stripe_success_url: successOverride,
      stripe_cancel_url: cancelOverride,
    }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const loc = locale && isValidLocale(locale) ? locale : DEFAULT_LOCALE
  const rechargePath = `/${loc}/recharge`

  return {
    stripe_success_url: `${baseUrl}${rechargePath}?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    stripe_cancel_url: `${baseUrl}${rechargePath}?stripe=cancel`,
  }
}

function isStripeCheckoutFallbackEnabled(): boolean {
  return process.env.STRIPE_RECHARGE_ALLOW_CHECKOUT === 'true'
}

function notifyUrl(): string {
  return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/recharge/notify`
}

/**
 * 生成业务订单号
 */
function generateBizOrderNo(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RECHARGE_${timestamp}_${random}`
}

async function resolveDefaultStripePaymentMethod(userId: string) {
  const methods = await getPaymentMethodsForUser(userId)
  return methods.find((m) => m.isDefault) ?? methods[0] ?? null
}

async function createStripeCheckoutRecharge(
  params: CreateRechargeOrderParams
): Promise<CreateRechargeOrderResult> {
  const { userId, amount, locale } = params
  const bizOrderNo = generateBizOrderNo()
  const client = getPaymentGatewayClient()
  const appId = getPaymentGatewayAppId()

  let gatewayResponse
  try {
    gatewayResponse = await client.createPayOrder({
      bizOrderNo,
      amount,
      payProvider: 'STRIPE',
      payMethod: payMethodForProvider('STRIPE'),
      currency: STRIPE_CHARGE_CURRENCY,
      title: `账户充值 - $${amount}`,
      notifyUrl: notifyUrl(),
      appId,
      meta: buildStripeCheckoutMeta(locale),
    })
  } catch (error) {
    console.error('Stripe Checkout 兜底创建订单失败:', error)
    throw new Error(`创建支付订单失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }

  const payUrl = gatewayResponse.pay_url || ''
  if (!payUrl) {
    throw new Error('支付网关未返回 Stripe 支付链接')
  }

  const order = await createRechargeOrder({
    userId,
    bizOrderNo,
    amount: new Prisma.Decimal(amount),
    payProvider: 'STRIPE',
    qrcodeUrl: payUrl,
    gatewayOrderNo: gatewayResponse.gateway_order_no || null,
  })

  return {
    orderId: order.id,
    bizOrderNo: order.bizOrderNo,
    qrcodeUrl: '',
    payUrl,
    amount,
    payProvider: 'STRIPE',
  }
}

async function createStripeSavedCardRecharge(
  params: CreateRechargeOrderParams
): Promise<CreateRechargeOrderResult> {
  const { userId, amount } = params
  const defaultPm = await resolveDefaultStripePaymentMethod(userId)

  if (!defaultPm) {
    if (isStripeCheckoutFallbackEnabled()) {
      return createStripeCheckoutRecharge(params)
    }
    throw new RechargeError(
      'NEED_BIND_CARD',
      '请先在账单页绑定银行卡后再使用 Stripe 充值'
    )
  }

  const bizOrderNo = generateBizOrderNo()
  const client = getPaymentGatewayClient()
  const appId = getPaymentGatewayAppId()

  const order = await createRechargeOrder({
    userId,
    bizOrderNo,
    amount: new Prisma.Decimal(amount),
    payProvider: 'STRIPE',
    qrcodeUrl: null,
    gatewayOrderNo: null,
  })

  let charge
  try {
    charge = await client.createBillingCharge({
      bizUserId: userId,
      bizOrderNo,
      amount,
      currency: STRIPE_CHARGE_CURRENCY,
      paymentMethodId: defaultPm.paymentMethodId,
      idempotencyKey: `recharge-${bizOrderNo}`,
      notifyUrl: notifyUrl(),
      title: `账户充值 - $${amount}`,
      appId,
    })
  } catch (error) {
    await updateRechargeOrderStatus(order.id, {
      status: 'failed',
      processed: true,
    })

    if (error instanceof PaymentGatewayError) {
      if (error.code === 'NO_CUSTOMER' || error.code === 'NO_PAYMENT_METHOD') {
        throw new RechargeError(
          'NEED_BIND_CARD',
          '请先在账单页绑定银行卡后再使用 Stripe 充值'
        )
      }
      throw new Error(error.message)
    }
    throw error
  }

  await updateRechargeOrderStatus(order.id, {
    gatewayOrderNo: charge.gateway_order_no,
  })

  if (charge.status === 'succeeded') {
    const check = await checkPaymentStatusService(order.id)
    return {
      orderId: order.id,
      bizOrderNo: order.bizOrderNo,
      qrcodeUrl: '',
      amount,
      payProvider: 'STRIPE',
      stripeChargeStatus: 'succeeded',
      paid: check.paid,
    }
  }

  if (charge.status === 'requires_action') {
    return {
      orderId: order.id,
      bizOrderNo: order.bizOrderNo,
      qrcodeUrl: '',
      amount,
      payProvider: 'STRIPE',
      stripeChargeStatus: 'requires_action',
      clientSecret: charge.client_secret,
      requiresAction: true,
    }
  }

  return {
    orderId: order.id,
    bizOrderNo: order.bizOrderNo,
    qrcodeUrl: '',
    amount,
    payProvider: 'STRIPE',
    stripeChargeStatus: 'pending',
  }
}

/**
 * 创建充值订单
 */
export async function createRechargeOrderService(
  params: CreateRechargeOrderParams
): Promise<CreateRechargeOrderResult> {
  const { userId, amount, payProvider, locale } = params

  if (payProvider === 'STRIPE') {
    return createStripeSavedCardRecharge(params)
  }

  const bizOrderNo = generateBizOrderNo()
  const client = getPaymentGatewayClient()
  const appId = getPaymentGatewayAppId()

  let gatewayResponse
  try {
    const payMethod = payMethodForProvider(payProvider)
    gatewayResponse = await client.createPayOrder({
      bizOrderNo,
      amount,
      payProvider,
      payMethod,
      title: `账户充值 - ¥${amount}`,
      notifyUrl: notifyUrl(),
      appId,
      meta: null,
    })
  } catch (error) {
    console.error('调用支付网关创建订单失败:', {
      bizOrderNo,
      amount,
      payProvider,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new Error(`创建支付订单失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }

  const qrcodeUrl = gatewayResponse.qrcode_url || ''
  if (!qrcodeUrl) {
    throw new Error('支付网关未返回支付二维码')
  }

  const order = await createRechargeOrder({
    userId,
    bizOrderNo,
    amount: new Prisma.Decimal(amount),
    payProvider,
    qrcodeUrl,
    gatewayOrderNo: gatewayResponse.gateway_order_no || null,
  })

  return {
    orderId: order.id,
    bizOrderNo: order.bizOrderNo,
    qrcodeUrl,
    amount,
    payProvider,
  }
}

/**
 * 内部：执行支付成功入账逻辑（带幂等保护）
 * 同时被 handlePaymentNotify 和 checkPaymentStatusService 调用
 */
async function processPaymentSuccess(
  orderId: string,
  gatewayOrderNo?: string
): Promise<void> {
  let dingtalkPayload: {
    bizOrderNo: string
    payProvider: string
    payAmount: number
    creditAmountCny: number
    userPhone: string | null
    gatewayOrderNo: string | null
  } | null = null

  await prisma.$transaction(async (tx) => {
    const latestOrder = await tx.rechargeOrder.findUnique({
      where: { id: orderId },
      include: { user: { select: { phone: true } } },
    })
    if (!latestOrder || latestOrder.processed) return

    const payAmount = Number(latestOrder.amount)
    const creditAmount =
      latestOrder.payProvider === 'STRIPE'
        ? new Prisma.Decimal(stripeUsdToCreditCny(payAmount))
        : latestOrder.amount

    await tx.rechargeOrder.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        processed: true,
        paidAt: new Date(),
        ...(gatewayOrderNo ? { gatewayOrderNo } : {}),
      },
    })

    await tx.userBalance.upsert({
      where: { userId: latestOrder.userId },
      create: {
        userId: latestOrder.userId,
        balance: new Prisma.Decimal(0),
      },
      update: {},
    })

    await tx.userBalance.update({
      where: { userId: latestOrder.userId },
      data: {
        balance: { increment: creditAmount },
        updatedAt: new Date(),
      },
    })

    const description =
      latestOrder.payProvider === 'STRIPE'
        ? `充值订单 ${latestOrder.bizOrderNo} ($${payAmount} → ¥${creditAmount})`
        : `充值订单 ${latestOrder.bizOrderNo}`

    await tx.transaction.create({
      data: {
        userId: latestOrder.userId,
        amount: creditAmount,
        type: 'recharge',
        description,
      },
    })

    await tx.$executeRaw`
      SELECT pg_notify('user_balance_changed', 
        json_build_object('user_id', ${latestOrder.userId}::text, 'balance', 
          (SELECT balance::text FROM user_balances WHERE user_id = ${latestOrder.userId})
        )::text
      )
    `

    await grantInviteRechargeReward(latestOrder.userId, tx)

    dingtalkPayload = {
      bizOrderNo: latestOrder.bizOrderNo,
      payProvider: latestOrder.payProvider,
      payAmount,
      creditAmountCny: Number(creditAmount),
      userPhone: latestOrder.user.phone,
      gatewayOrderNo: gatewayOrderNo ?? latestOrder.gatewayOrderNo,
    }
  })

  if (dingtalkPayload) {
    notifyRechargeSuccess(dingtalkPayload).catch((err) => {
      console.error('发送钉钉充值到账通知失败:', err)
    })
  }
}

/**
 * 主动查询支付状态（前端轮询使用）
 */
export async function checkPaymentStatusService(
  orderId: string
): Promise<{ status: string; paid: boolean }> {
  const order = await findRechargeOrderById(orderId)
  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status === 'paid') {
    return { status: 'paid', paid: true }
  }
  if (order.status === 'failed' || order.status === 'canceled') {
    return { status: order.status, paid: false }
  }

  if (!order.gatewayOrderNo) {
    return { status: 'pending', paid: false }
  }

  const client = getPaymentGatewayClient()
  let gatewayResult: any
  try {
    gatewayResult = await client.queryPayOrder(order.gatewayOrderNo)
  } catch (error) {
    console.error('主动查询支付网关失败:', error)
    return { status: 'pending', paid: false }
  }

  const gatewayStatus: string =
    gatewayResult?.status ?? gatewayResult?.data?.status ?? ''

  if (gatewayStatus === 'SUCCESS') {
    await processPaymentSuccess(order.id, order.gatewayOrderNo)
    return { status: 'paid', paid: true }
  }

  if (gatewayStatus === 'FAILED' || gatewayStatus === 'CLOSED') {
    await updateRechargeOrderStatus(order.id, {
      status: 'failed',
      processed: true,
    })
    return { status: 'failed', paid: false }
  }

  return { status: 'pending', paid: false }
}

/**
 * 处理支付回调通知
 */
export async function handlePaymentNotify(
  notifyData: PaymentNotifyData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const apiSecret = process.env.PAYMENT_GATEWAY_API_SECRET
    if (!apiSecret) {
      return { ok: false, error: '支付网关配置缺失' }
    }

    const receivedSign = notifyData.sign
    if (!receivedSign) {
      return { ok: false, error: '缺少签名' }
    }

    const { sign: _receivedSignField, ...dataWithoutSign } = notifyData

    try {
      verifyNotifySign(apiSecret, dataWithoutSign, receivedSign)
    } catch (error) {
      return { ok: false, error: `签名验证失败: ${error instanceof Error ? error.message : 'unknown'}` }
    }

    const { biz_order_no, gateway_order_no, status, amount } = notifyData
    const order = await findRechargeOrderByBizOrderNo(biz_order_no)

    if (!order) {
      return { ok: false, error: '订单不存在' }
    }

    if (order.processed) {
      return { ok: true }
    }

    if (order.status !== 'pending') {
      return { ok: false, error: `订单状态异常: ${order.status}` }
    }

    const orderAmount = Number(order.amount)
    if (Math.abs(orderAmount - amount) > 0.01) {
      return { ok: false, error: `订单金额不匹配: 期望 ${orderAmount}, 实际 ${amount}` }
    }

    if (status === 'SUCCESS') {
      await processPaymentSuccess(order.id, gateway_order_no)
      return { ok: true }
    }

    await updateRechargeOrderStatus(order.id, {
      status: status === 'FAILED' ? 'failed' : 'canceled',
      processed: true,
      gatewayOrderNo: gateway_order_no,
    })

    return { ok: true, error: `支付状态: ${status}` }
  } catch (error) {
    console.error('处理支付通知异常:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : '处理支付通知异常',
    }
  }
}
