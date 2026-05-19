import { isLikelyPrivateIpv4 } from "./client-ip"

/**
 * 使用 ip-api.com 免费接口（HTTP）解析大致地理位置，失败则返回「未知」。
 * 内网 / 非法 IP 不请求外网。
 */
export async function resolveIpGeoLabel(ip: string): Promise<string> {
  if (!ip || ip === "unknown") return "未知"
  if (isLikelyPrivateIpv4(ip)) return "内网或本机"

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 2500)
  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city&lang=zh-CN`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return "未知"
    const data = (await res.json()) as {
      status?: string
      country?: string
      regionName?: string
      city?: string
    }
    if (data.status !== "success") return "未知"
    const parts = [data.country, data.regionName, data.city].filter(Boolean)
    return parts.length > 0 ? parts.join(" ") : "未知"
  } catch {
    return "未知"
  } finally {
    clearTimeout(t)
  }
}

