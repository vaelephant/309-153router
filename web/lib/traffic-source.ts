export const TRAFFIC_SOURCE_STORAGE_KEY = 'optrouter_traffic_source'

export function parseTrafficSource(params: URLSearchParams | null): string | null {
  if (!params) return null
  const from = params.get('from')?.trim()
  if (from) return from
  const source = params.get('source')?.trim()
  return source || null
}

export function persistTrafficSource(source: string | null): void {
  if (typeof window === 'undefined' || !source) return
  try {
    sessionStorage.setItem(TRAFFIC_SOURCE_STORAGE_KEY, source)
  } catch {
    // ignore quota / private mode
  }
}

export function getPersistedTrafficSource(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(TRAFFIC_SOURCE_STORAGE_KEY)
  } catch {
    return null
  }
}

/** URL 参数优先，否则读 session 中已保存的来源 */
export function resolveTrafficSource(params: URLSearchParams | null): string | null {
  const fromUrl = parseTrafficSource(params)
  if (fromUrl) {
    persistTrafficSource(fromUrl)
    return fromUrl
  }
  return getPersistedTrafficSource()
}

/** 供 LocaleLink 使用：不含 locale 前缀，由 LocaleLink 自动拼接 */
export function buildAuthHref(
  _locale: string,
  path: 'register' | 'login',
  source: string | null
): string {
  const base = `/${path}`
  if (!source) return base
  return `${base}?from=${encodeURIComponent(source)}`
}

export function appendSourceToMessage(message: string | undefined, source: string | null): string | undefined {
  if (!source) return message
  const tag = `[来源: ${source}]`
  if (!message?.trim()) return tag
  return `${tag}\n${message.trim()}`
}
