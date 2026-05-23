import crypto from "crypto"

/**
 * 联系表单 → 钉钉通知
 *
 * 优先使用联系专用变量；未配置时回退到注册/登录同一套钉钉机器人：
 * - DINGTALK_CONTACT_WEBHOOK_URL / DINGTALK_CONTACT_SECRET（可选，独立群）
 * - 回退：DINGTALK_WEBHOOK_URL + DINGTALK_SECRET（需 DINGTALK_ENABLED=true，或未单独关闭 CONTACT）
 *
 * - DINGTALK_CONTACT_ENABLED：可选，false/0 强制关闭留资钉钉（即使已配主 Webhook）
 */

export interface DingTalkTextMessage {
  msgtype: "text"
  text: { content: string }
}

export interface DingTalkMarkdownMessage {
  msgtype: "markdown"
  markdown: { title: string; text: string }
}

function isMainDingTalkEnabled(): boolean {
  const enabled = process.env.DINGTALK_ENABLED
  return enabled === "true" || enabled === "1"
}

/** 解析留资通知用的 Webhook（专用优先，否则复用 DINGTALK_WEBHOOK_URL） */
function resolveContactWebhookConfig(): { url: string; secret?: string } | null {
  if (process.env.DINGTALK_CONTACT_ENABLED === "false" || process.env.DINGTALK_CONTACT_ENABLED === "0") {
    return null
  }

  const contactUrl = process.env.DINGTALK_CONTACT_WEBHOOK_URL?.trim()
  if (contactUrl) {
    return {
      url: contactUrl,
      secret: process.env.DINGTALK_CONTACT_SECRET?.trim() || undefined,
    }
  }

  const mainUrl = process.env.DINGTALK_WEBHOOK_URL?.trim()
  if (!mainUrl) return null

  // 未配专用 Webhook 时：主机器人已启用则用于留资
  if (isMainDingTalkEnabled() || process.env.DINGTALK_CONTACT_ENABLED === "true" || process.env.DINGTALK_CONTACT_ENABLED === "1") {
    return {
      url: mainUrl,
      secret: process.env.DINGTALK_SECRET?.trim() || undefined,
    }
  }

  return null
}

export function isContactDingTalkEnabled(): boolean {
  return resolveContactWebhookConfig() !== null
}

function formatTimeCN(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

function getContactWebhookUrl(): string | null {
  const cfg = resolveContactWebhookConfig()
  if (!cfg) return null

  const secret = cfg.secret
  if (!secret) return cfg.url

  const timestamp = Date.now()
  const stringToSign = `${timestamp}\n${secret}`
  const sign = encodeURIComponent(
    crypto.createHmac("sha256", secret).update(stringToSign).digest("base64")
  )
  return `${cfg.url}&timestamp=${timestamp}&sign=${sign}`
}

async function postToWebhook(payload: DingTalkTextMessage | DingTalkMarkdownMessage, timeoutMs: number) {
  const webhook = getContactWebhookUrl()
  if (!webhook) return

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`DingTalk webhook failed: ${res.status} ${text}`.trim())
    }
  } finally {
    clearTimeout(timer)
  }
}

const FORM_LABELS: Record<string, string> = {
  ai_gateway_contact: "朋友圈着陆页",
  home_contact: "官网联系表单",
}

function isLocalDomain(domain: string): boolean {
  const d = domain.toLowerCase()
  return (
    d.includes("localhost") ||
    d.startsWith("127.0.0.1") ||
    d.startsWith("::1") ||
    /^192\.168\.\d+\.\d+/.test(d) ||
    /^10\.\d+\.\d+\.\d+/.test(d)
  )
}

function formatNoteForDisplay(note: string, source: string): string | null {
  const trimmed = note.trim()
  if (!trimmed) return null
  const sourceTag = source ? `[来源: ${source}]` : ""
  if (trimmed === sourceTag) return null
  if (source && trimmed.replace(sourceTag, "").trim() === "") return null
  return trimmed.replace(/^\[来源:[^\]]+\]\s*/i, "").trim() || null
}

function shortenUserAgent(ua: string): string {
  const s = ua.trim()
  if (s.length <= 120) return s
  return `${s.slice(0, 117)}…`
}

function buildContactNotifyText(params: {
  phone: string
  createdAt: Date
  formName?: string | null
  source?: string | null
  note?: string | null
  domain?: string
  clientIp?: string
  userAgent?: string
}): string {
  const formKey = params.formName?.trim() || ""
  const formLabel = FORM_LABELS[formKey] || formKey || "网站留资"
  const source = params.source?.trim() || ""
  const note = formatNoteForDisplay(params.note?.trim() || "", source)
  const time = formatTimeCN(params.createdAt)
  const domain = params.domain?.trim() || ""
  const ip = params.clientIp?.trim() || "未知"
  const ua = params.userAgent?.trim() ? shortenUserAgent(params.userAgent.trim()) : "未知"

  const lines = [`【OptRouter】${formLabel}`, `手机：${params.phone}`]
  if (source) lines.push(`渠道：${source}`)
  if (note) lines.push(`备注：${note}`)
  if (domain && !isLocalDomain(domain)) lines.push(`站点：${domain}`)
  lines.push(`IP：${ip}`)
  lines.push(`UA：${ua}`)
  lines.push(`时间：${time}`)
  return lines.join("\n")
}

export async function notifyContactSubmitted(params: {
  domain?: string
  phone: string
  userAgent?: string
  createdAt: Date
  clientIp?: string
  formName?: string | null
  source?: string | null
  note?: string | null
}): Promise<void> {
  const content = buildContactNotifyText({
    phone: params.phone,
    createdAt: params.createdAt,
    formName: params.formName,
    source: params.source,
    note: params.note,
    domain: params.domain,
    clientIp: params.clientIp,
    userAgent: params.userAgent,
  })

  await postToWebhook({ msgtype: "text", text: { content } }, 2500)
}

