/**
 * 首页公开展示用统计：真实今日数据 + 固定基底（避免冷启动全 0）
 * 可通过环境变量覆盖，无需改代码。
 */

const DEFAULT_BASELINE_REQUESTS = 1286
/** 与请求数比例约 410 Token/次，贴近多模型混合调用 */
const DEFAULT_BASELINE_TOKENS = 528_000

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw == null || raw.trim() === '') return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export function getPublicStatsBaseline(): { requests: number; tokens: number } {
  return {
    requests: parsePositiveInt(
      process.env.NEXT_PUBLIC_STATS_BASELINE_REQUESTS,
      DEFAULT_BASELINE_REQUESTS
    ),
    tokens: parsePositiveInt(
      process.env.NEXT_PUBLIC_STATS_BASELINE_TOKENS,
      DEFAULT_BASELINE_TOKENS
    ),
  }
}

/** 展示值 = 今日真实 + 基底（仅用于首页等对外展示，非财务口径） */
export function applyPublicStatsDisplay(actual: {
  requests: number
  tokens: number
}): { requests: number; tokens: number; baseline: { requests: number; tokens: number } } {
  const baseline = getPublicStatsBaseline()
  return {
    requests: actual.requests + baseline.requests,
    tokens: actual.tokens + baseline.tokens,
    baseline,
  }
}
