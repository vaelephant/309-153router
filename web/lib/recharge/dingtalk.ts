import crypto from 'crypto'

/**
 * 充值到账 → 钉钉（独立机器人，与注册/登录 DINGTALK_* 分开）
 *
 * DINGTALK_RECHARGE_ENABLED=true
 * DINGTALK_RECHARGE_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=...
 * DINGTALK_RECHARGE_SECRET=SEC...   # 可选，加签
 */

const PAY_PROVIDER_CN: Record<string, string> = {
  WECHAT: '微信支付',
  ALIPAY: '支付宝',
  STRIPE: 'Stripe',
}

function isRechargeDingTalkEnabled(): boolean {
  const enabled = process.env.DINGTALK_RECHARGE_ENABLED
  return enabled === 'true' || enabled === '1'
}

function getRechargeWebhookUrl(): string | null {
  if (!isRechargeDingTalkEnabled()) {
    return null
  }

  const url = process.env.DINGTALK_RECHARGE_WEBHOOK_URL?.trim()
  if (!url) {
    console.warn('⚠️ 充值钉钉：DINGTALK_RECHARGE_ENABLED 已开但未配置 DINGTALK_RECHARGE_WEBHOOK_URL')
    return null
  }

  const secret = process.env.DINGTALK_RECHARGE_SECRET?.trim()
  if (!secret) return url

  const timestamp = Date.now()
  const stringToSign = `${timestamp}\n${secret}`
  const sign = encodeURIComponent(
    crypto.createHmac('sha256', secret).update(stringToSign).digest('base64')
  )
  return `${url}&timestamp=${timestamp}&sign=${sign}`
}

export function isRechargeDingTalkConfigured(): boolean {
  return isRechargeDingTalkEnabled() && Boolean(process.env.DINGTALK_RECHARGE_WEBHOOK_URL?.trim())
}

function formatChinaTime(date: Date = new Date()): string {
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/** 充值到账通知 */
export async function notifyRechargeSuccess(params: {
  bizOrderNo: string
  payProvider: string
  payAmount: number
  creditAmountCny: number
  userPhone?: string | null
  gatewayOrderNo?: string | null
}): Promise<boolean> {
  const webhookUrl = getRechargeWebhookUrl()
  if (!webhookUrl) return false

  const provider = PAY_PROVIDER_CN[params.payProvider] ?? params.payProvider
  const isStripe = params.payProvider === 'STRIPE'

  const lines = [
    '💰 充值到账通知',
    '',
    `📋 订单号：${params.bizOrderNo}`,
    isStripe
      ? `💵 扣款：$${params.payAmount.toFixed(2)} → 入账 ¥${params.creditAmountCny.toFixed(2)}`
      : `💵 金额：¥${params.creditAmountCny.toFixed(2)}`,
    `💳 渠道：${provider}`,
  ]

  if (params.userPhone) lines.push(`📱 用户：${params.userPhone}`)
  if (params.gatewayOrderNo) lines.push(`🔗 网关单号：${params.gatewayOrderNo}`)
  lines.push(`⏰ 到账时间：${formatChinaTime()}`)

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'text',
        text: { content: lines.join('\n') },
      }),
    })

    if (!res.ok) {
      console.error(`❌ 充值钉钉 Webhook 响应异常: ${res.status} ${res.statusText}`)
      return false
    }

    const json = (await res.json()) as { errcode?: number; errmsg?: string }
    if (json.errcode !== 0) {
      console.error(`❌ 充值钉钉返回错误: ${json.errcode} - ${json.errmsg}`)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ 发送充值钉钉通知异常:', error)
    return false
  }
}
