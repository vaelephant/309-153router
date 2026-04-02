import { NextRequest, NextResponse } from "next/server"
import { getClientIpFromRequest } from "@/lib/contact-lead/client-ip"
import { notifyContactSubmitted } from "@/lib/contact-lead/dingtalk"

const BASE = process.env.LEAD_API_BASE_URL?.replace(/\/$/, "")
const PROJECT_NAME = process.env.LEAD_PROJECT_NAME?.trim()
const PROJECT_SLUG = process.env.LEAD_PROJECT_SLUG?.trim()
const API_KEY = process.env.LEAD_API_KEY?.trim()

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

export async function POST(req: NextRequest) {
  if (!BASE || !API_KEY || (!PROJECT_NAME && !PROJECT_SLUG)) {
    return NextResponse.json(
      { success: false, error: "线索服务未配置" },
      { status: 500 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "无效 JSON" }, { status: 400 })
  }

  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    ""

  const payload = {
    phone: body.phone,
    message: body.message ?? null,
    name: body.name ?? null,
    email: body.email ?? null,
    company: body.company ?? null,
    domain:
      typeof body.domain === "string" && body.domain.trim()
        ? body.domain.trim()
        : host,
    form_name: body.form_name ?? null,
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
    const domainForNotify =
      typeof payload.domain === "string" && payload.domain.trim()
        ? payload.domain.trim()
        : host

    void notifyContactSubmitted({
      domain: domainForNotify,
      phone: String(payload.phone ?? ""),
      userAgent: req.headers.get("user-agent") ?? undefined,
      createdAt: new Date(),
      clientIp: getClientIpFromRequest(req),
      formName:
        payload.form_name === null || payload.form_name === undefined
          ? null
          : String(payload.form_name),
    }).catch((err) => {
      console.error("DingTalk notify failed:", err)
    })

    return NextResponse.json({ ...data, success: true }, { status: res.status })
  }

  const msg =
    (typeof data.message === "string" && data.message) ||
    (typeof data.error === "string" && data.error) ||
    "提交失败，请稍后重试"

  return NextResponse.json({ success: false, error: msg }, { status: res.status })
}

