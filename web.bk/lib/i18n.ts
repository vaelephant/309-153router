export const LOCALES = ['zh', 'en', 'ja'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'zh'

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

export type Messages = Record<string, unknown>

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export function createT(messages: Messages) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const value = getNested(messages as Record<string, unknown>, key)
    if (typeof value !== 'string') return key
    if (!params) return value
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    )
  }
}
