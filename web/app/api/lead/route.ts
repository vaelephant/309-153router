import { NextRequest, NextResponse } from "next/server"
import { getClientIpFromRequest } from "@/lib/contact-lead/client-ip"
import {
  isContactDingTalkEnabled,
  notifyContactSubmitted,
} from "@/lib/contact-lead/dingtalk"

const BASE = process.env.LEAD_API_BASE_URL?.replace(/\/$/, "")
const PROJECT_NAME = process.env.LEAD_PROJECT_NAME?.trim()
const PROJECT_SLUG = process.env.LEAD_PROJECT_SLUG?.trim()
const API_KEY = process.env.LEAD_API_KEY?.trim()

function isLeadApiConfigured(): boolean {
  return Boolean(BASE && API_KEY && (PROJECT_NAME || PROJECT_SLUG))
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 11) return null
  return digits
}

function isLikelyHttpHttpsMismatch(err: unknown): boolean {
  const chain: unknown[] = [err]
  let c: unknown = err
  for (let i = 0; i < 5 && c && typeof c === "object" && "cause" in c; i++) {
    c = (c as { cause?: unknown }).cause
    if (c !== undefined) chain.push(c)
  }
  return chain.some((e) => {
    if (!e || typeof e !== "object") return false
    const code =
      "code" in e && typeof (e as { code?: string }).code === "string"
        ? (e as { code: string }).code
        : ""
    if (code === "ERR_SSL_PACKET_LENGTH_TOO_LONG") return true
    const msg = "message" in e ? String((e as Error).message) : ""
    return /SSL|TLS|packet length|wrong version number/i.test(msg)
  })
}

async function pushDingTalkNotify(
  req: NextRequest,
  params: {
    phone: string
    domain: string
    formName: string | null
    source: string | null
    note: string | null
  }
) {
  await notifyContactSubmitted({
    domain: params.domain,
    phone: params.phone,
    userAgent: req.headers.get("user-agent") ?? undefined,
    createdAt: new Date(),
    clientIp: getClientIpFromRequest(req),
    formName: params.formName,
    source: params.source,
    note: params.note,
  })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "无效 JSON" }, { status: 400 })
  }

  const phone = normalizePhone(body.phone)
  if (!phone) {
    return NextResponse.json({ success: false, error: "请输入正确的11位手机号" }, { status: 400 })
  }

  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    ""

  const source =
    typeof body.source === "string" && body.source.trim() ? body.source.trim() : null
  let message =
    typeof body.message === "string" ? body.message : body.message == null ? null : String(body.message)
  if (source && message && !message.includes("[来源:")) {
    message = `[来源: ${source}]\n${message}`
  } else if (source && !message) {
    message = `[来源: ${source}]`
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const noteParts = [message, name ? `姓名：${name}` : ""].filter(Boolean)
  const note = noteParts.length ? noteParts.join("\n") : null

  const domain =
    typeof body.domain === "string" && body.domain.trim() ? body.domain.trim() : host

  const formName =
    body.form_name === null || body.form_name === undefined
      ? null
      : String(body.form_name)

  const notifyCtx = { phone, domain, formName, source, note }

  // 未配置外部线索 API：仅钉钉通知（着陆页常用）
  if (!isLeadApiConfigured()) {
    if (!isContactDingTalkEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "联系通知未配置，请在环境变量中设置 DINGTALK_CONTACT_WEBHOOK_URL",
        },
        { status: 500 }
      )
    }
    try {
      await pushDingTalkNotify(req, notifyCtx)
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error("DingTalk contact notify failed:", err)
      return NextResponse.json(
        { success: false, error: "通知发送失败，请稍后重试" },
        { status: 502 }
      )
    }
  }

  const payload = {
    phone,
    message,
    name: body.name ?? null,
    email: body.email ?? null,
    company: body.company ?? null,
    domain,
    form_name: formName,
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  }
  if (PROJECT_SLUG) {
    headers["X-Project-Slug"] = PROJECT_SLUG
  } else {
    headers["X-Project-Name"] = PROJECT_NAME!
  }

  let res: Response
  try {
    res = await fetch(`${BASE}/api/v1/contact`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error("Lead API fetch failed:", err)
    const hint = isLikelyHttpHttpsMismatch(err)
      ? "无法连接线索服务：请检查 LEAD_API_BASE_URL 是否与服务端一致（常见为 https 配成了纯 http 服务，或端口错误）"
      : "线索服务暂时不可用，请稍后重试"
    return NextResponse.json({ success: false, error: hint }, { status: 502 })
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (res.ok) {
    if (isContactDingTalkEnabled()) {
      void pushDingTalkNotify(req, notifyCtx).catch((err) => {
        console.error("DingTalk notify failed:", err)
      })
    }
    return NextResponse.json({ ...data, success: true }, { status: res.status })
  }

  const msg =
    (typeof data.message === "string" && data.message) ||
    (typeof data.error === "string" && data.error) ||
    "提交失败，请稍后重试"

  return NextResponse.json({ success: false, error: msg }, { status: res.status })
}
