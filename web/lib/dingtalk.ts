/**
 * 钉钉 Webhook 通知模块
 *
 * 环境变量：
 *   DINGTALK_ENABLED      — "true" 或 "1" 开启
 *   DINGTALK_WEBHOOK_URL  — 钉钉自定义机器人 Webhook 地址
 *   DINGTALK_SECRET       — 加签密钥（可选，如果机器人开启了加签安全设置）
 */

import crypto from "crypto"

// ─── 类型 ──────────────────────────────────────────────────────────────────────

interface DingTalkTextMessage {
  msgtype: "text"
  text: { content: string }
}

interface DingTalkMarkdownMessage {
  msgtype: "markdown"
  markdown: { title: string; text: string }
}

type DingTalkMessage = DingTalkTextMessage | DingTalkMarkdownMessage

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

/** 格式化为中国时间字符串 */
function formatChinaTime(date: Date = new Date()): string {
  return date.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/** 检查钉钉是否启用 */
function isDingTalkEnabled(): boolean {
  const enabled = process.env.DINGTALK_ENABLED
  return enabled === "true" || enabled === "1"
}

/** 获取最终 Webhook URL（支持加签） */
function getWebhookUrl(): string | null {
  if (!isDingTalkEnabled()) {
    console.warn("⚠️ 钉钉通知未启用，已跳过")
    return null
  }

  const url = process.env.DINGTALK_WEBHOOK_URL
  if (!url) {
    console.warn("⚠️ 钉钉 Webhook URL 未配置，已跳过通知")
    return null
  }

  // 如果配置了加签密钥，自动追加签名参数
  const secret = process.env.DINGTALK_SECRET
  if (secret) {
    const timestamp = Date.now()
    const stringToSign = `${timestamp}\n${secret}`
    const sign = encodeURIComponent(
      crypto.createHmac("sha256", secret).update(stringToSign).digest("base64")
    )
    return `${url}&timestamp=${timestamp}&sign=${sign}`
  }

  return url
}

// ─── 发送核心 ──────────────────────────────────────────────────────────────────

async function sendDingTalk(payload: DingTalkMessage): Promise<boolean> {
  const webhookUrl = getWebhookUrl()
  if (!webhookUrl) return false

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`❌ 钉钉 Webhook 响应异常: ${res.status} ${res.statusText}`)
      return false
    }

    const json = (await res.json()) as { errcode?: number; errmsg?: string }
    if (json.errcode !== 0) {
      console.error(`❌ 钉钉接口返回错误: ${json.errcode} - ${json.errmsg}`)
      return false
    }

    return true
  } catch (error) {
    console.error("❌ 发送钉钉消息异常:", error)
    return false
  }
}

/** 发送纯文本消息 */
async function sendDingTalkMessage(content: string): Promise<boolean> {
  return sendDingTalk({
    msgtype: "text",
    text: { content },
  })
}

// ─── 业务通知 ──────────────────────────────────────────────────────────────────

/** 用户注册通知 */
export function notifyUserRegister(
  phone: string,
  inviteCode?: string | null,
  userAgent?: string | null,
  ipAddress?: string | null,
  trafficSource?: string | null
): Promise<boolean> {
  const lines = [
    `🔔 新用户注册通知`,
    ``,
    `📱 手机号：${phone}`,
    `⏰ 注册时间：${formatChinaTime()}`,
    `🎫 邀请码：${inviteCode || "无"}`,
    `📣 来源：${trafficSource || "无"}`,
  ]

  if (userAgent) lines.push(`💻 设备信息：${userAgent}`)
  if (ipAddress) lines.push(`🌐 IP地址：${ipAddress}`)

  lines.push(``, `系统已自动记录该用户信息。`)

  return sendDingTalkMessage(lines.join("\n"))
}

/** 用户登录通知 */
export function notifyUserLogin(
  phone: string,
  userAgent?: string | null,
  ipAddress?: string | null
): Promise<boolean> {
  const lines = [
    `🔔 用户登录通知`,
    ``,
    `📱 手机号：${phone}`,
    `⏰ 登录时间：${formatChinaTime()}`,
  ]

  if (userAgent) lines.push(`💻 设备信息：${userAgent}`)
  if (ipAddress) lines.push(`🌐 IP地址：${ipAddress}`)

  lines.push(``, `用户已成功登录系统。`)

  return sendDingTalkMessage(lines.join("\n"))
}
