import crypto from "crypto";
import { resolveIpGeoLabel } from "./ip-geo";

/**
 * 联系表单 → 钉钉通知（独立机器人 / 独立群）
 *
 * - DINGTALK_CONTACT_ENABLED：可选，false/0 关闭；未设置时只要有 Webhook 即发送
 * - DINGTALK_CONTACT_WEBHOOK_URL
 * - DINGTALK_CONTACT_SECRET：可选，加签
 */

export interface DingTalkTextMessage {
  msgtype: "text";
  text: { content: string };
}

export interface DingTalkMarkdownMessage {
  msgtype: "markdown";
  markdown: { title: string; text: string };
}

function isContactDingTalkEnabled(): boolean {
  const explicit = process.env.DINGTALK_CONTACT_ENABLED;
  if (explicit === "false" || explicit === "0") return false;
  if (explicit === "true" || explicit === "1") return true;
  return Boolean(process.env.DINGTALK_CONTACT_WEBHOOK_URL?.trim());
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
  }).format(date);
}

function getContactWebhookUrl(): string | null {
  if (!isContactDingTalkEnabled()) return null;
  const url = process.env.DINGTALK_CONTACT_WEBHOOK_URL?.trim();
  if (!url) return null;

  const secret = process.env.DINGTALK_CONTACT_SECRET?.trim();
  if (!secret) return url;

  const timestamp = Date.now();
  const stringToSign = `${timestamp}\n${secret}`;
  const sign = encodeURIComponent(
    crypto.createHmac("sha256", secret).update(stringToSign).digest("base64")
  );
  return `${url}&timestamp=${timestamp}&sign=${sign}`;
}

async function postToWebhook(
  payload: DingTalkTextMessage | DingTalkMarkdownMessage,
  timeoutMs: number
) {
  const webhook = getContactWebhookUrl();
  if (!webhook) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`DingTalk webhook failed: ${res.status} ${text}`.trim());
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function notifyContactSubmitted(params: {
  domain?: string;
  phone: string;
  userAgent?: string;
  createdAt: Date;
  clientIp?: string;
  formName?: string | null;
}): Promise<void> {
  const ua = params.userAgent?.trim() || "Unknown";
  const time = formatTimeCN(params.createdAt);
  const domain = params.domain?.trim() || "unknown";
  const ip = params.clientIp?.trim() || "unknown";
  const formLabel = params.formName?.trim() || "（未标注）";

  let geo = "未知";
  if (ip && ip !== "unknown") {
    geo = await resolveIpGeoLabel(ip);
  }

  const title = `联系我们新提交 - ${formLabel} - ${domain}`;
  const text = [
    `### 联系我们新提交`,
    ``,
    `- **来源域名**：${domain}`,
    `- **表单**：${formLabel}`,
    `- **手机号**：${params.phone}`,
    `- **IP地址**：${ip}`,
    `- **地理位置**：${geo}`,
    `- **UA**：${ua}`,
    `- **提交时间**：${time}`,
  ].join("\n");

  try {
    await postToWebhook(
      { msgtype: "markdown", markdown: { title, text } },
      2500
    );
  } catch {
    const fallback = [
      `【${domain}】联系我们新提交`,
      `表单：${formLabel}`,
      `手机号：${params.phone}`,
      `IP：${ip}`,
      `位置：${geo}`,
      `UA：${ua}`,
      `时间：${time}`,
    ].join("\n");
    await postToWebhook({ msgtype: "text", text: { content: fallback } }, 2500);
  }
}
