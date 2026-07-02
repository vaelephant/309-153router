import crypto from 'crypto'

import type { BlogCategory } from './article-types'
import { getBlogCategoryLabel } from './blog-categories'
import { absoluteUrl, getSiteUrl } from '../site-url'

/**
 * 新闻资讯 AI 生成 → 钉钉播报（独立机器人 / 独立群）
 *
 * 与 lib/dingtalk.ts（注册/登录）、DINGTALK_RECHARGE_*、DINGTALK_CONTACT_* 分开配置。
 *
 * DINGTALK_NEWS_ENABLED=true
 * DINGTALK_NEWS_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=...
 * DINGTALK_NEWS_SECRET=SEC...   # 机器人开启加签时必填（与 BOOGOO 一致）
 */

export type NewsPublishedNotifyInput = {
  title: string
  slug: string
  category: BlogCategory
  tags?: string[]
  publishedAt?: string | Date
}

function isNewsDingTalkEnabled(): boolean {
  const explicit = process.env.DINGTALK_NEWS_ENABLED
  if (explicit === 'false' || explicit === '0') return false
  if (explicit === 'true' || explicit === '1') return true
  // 未显式开关时：webhook + secret 都配则启用（同 BOOGOO）
  return Boolean(
    process.env.DINGTALK_NEWS_WEBHOOK_URL?.trim() &&
      process.env.DINGTALK_NEWS_SECRET?.trim()
  )
}

export function isNewsDingTalkConfigured(): boolean {
  return (
    isNewsDingTalkEnabled() &&
    Boolean(process.env.DINGTALK_NEWS_WEBHOOK_URL?.trim()) &&
    Boolean(process.env.DINGTALK_NEWS_SECRET?.trim())
  )
}

function buildSignedWebhookUrl(webhookUrl: string, secret: string): string {
  const timestamp = Date.now()
  const sign = encodeURIComponent(
    crypto.createHmac('sha256', secret).update(`${timestamp}\n${secret}`).digest('base64')
  )
  const separator = webhookUrl.includes('?') ? '&' : '?'
  return `${webhookUrl}${separator}timestamp=${timestamp}&sign=${sign}`
}

function getNewsWebhookUrl(): string | null {
  if (!isNewsDingTalkEnabled()) {
    return null
  }

  const url = process.env.DINGTALK_NEWS_WEBHOOK_URL?.trim()
  if (!url) {
    console.warn('⚠️ 新闻钉钉：已启用但未配置 DINGTALK_NEWS_WEBHOOK_URL')
    return null
  }

  const secret = process.env.DINGTALK_NEWS_SECRET?.trim()
  if (!secret) {
    console.warn('⚠️ 新闻钉钉：未配置 DINGTALK_NEWS_SECRET（加签机器人必填）')
    return null
  }

  return buildSignedWebhookUrl(url, secret)
}

/** 新闻播报时间：YYYY-MM-DD HH:mm:ss（北京时间） */
export function formatNewsNotifyTime(date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date instanceof Date ? date : new Date(date))
}

/** 纯文本播报正文（与 BOOGOO 格式对齐，OptRouter 字段适配） */
export function formatNewsPublishedText(input: NewsPublishedNotifyInput): string {
  const host = new URL(getSiteUrl()).host
  const categoryLabel = getBlogCategoryLabel(input.category)
  const tags = (input.tags ?? []).filter(Boolean)
  const source =
    tags.length > 0
      ? `AI 自动生成 · ${categoryLabel} · ${tags.join('、')}`
      : `AI 自动生成 · ${categoryLabel}`
  const publishedAt = input.publishedAt ?? new Date()
  const header = `✅ 新闻生成完成！(${host} - OptRouter 新闻资讯)`

  return [
    header,
    `标题： ${input.title.trim()}`,
    `来源： ${source}`,
    `时间： ${formatNewsNotifyTime(publishedAt)}`,
    `链接： ${absoluteUrl(`/zh/blog/${input.slug}`)}`,
  ].join('\n')
}

async function sendNewsDingTalkText(content: string): Promise<boolean> {
  const webhookUrl = getNewsWebhookUrl()
  if (!webhookUrl) return false

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'text',
        text: { content },
      }),
    })

    const json = (await res.json().catch(() => ({}))) as {
      errcode?: number
      errmsg?: string
    }

    if (!res.ok || (json.errcode !== undefined && json.errcode !== 0)) {
      console.error('❌ 新闻钉钉发送失败:', json.errcode, json.errmsg ?? res.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ 新闻钉钉请求异常:', error instanceof Error ? error.message : error)
    return false
  }
}

/** 新闻生成成功后的钉钉播报（fire-and-forget 友好，返回是否发送成功） */
export async function notifyNewsPublished(
  input: NewsPublishedNotifyInput
): Promise<boolean> {
  return sendNewsDingTalkText(formatNewsPublishedText(input))
}

/** 不 await 时使用 */
export function notifyNewsPublishedAsync(input: NewsPublishedNotifyInput): void {
  void notifyNewsPublished(input)
}
