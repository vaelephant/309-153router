import type { NextRequest } from "next/server"

/**
 * 从反向代理常见头里取真实客户端 IP（取不到则 unknown）
 */
export function getClientIpFromRequest(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get("x-real-ip")?.trim()
  if (real) return real
  const cf = req.headers.get("cf-connecting-ip")?.trim()
  if (cf) return cf
  return "unknown"
}

export function isLikelyPrivateIpv4(ip: string): boolean {
  if (!ip || ip === "unknown") return true
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip)
  if (!m) return false
  const a = Number(m[1])
  const b = Number(m[2])
  if ([a, b, Number(m[3]), Number(m[4])].some((n) => n > 255)) return true
  if (a === 10) return true
  if (a === 127) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}

