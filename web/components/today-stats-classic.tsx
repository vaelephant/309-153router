"use client"

import { useState, useEffect, useRef } from "react"

const DURATION_MS = 1200

function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      setValue((prev) => (prev > 0 ? target : 0))
      return
    }
    setValue(0)
    startRef.current = null

    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now
      const elapsed = now - startRef.current
      const t = Math.min(elapsed / DURATION_MS, 1)
      const easeOut = 1 - (1 - t) ** 3
      setValue(Math.round(target * easeOut))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, enabled])

  return value
}

function useInView(options?: { rootMargin?: string; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { rootMargin: options?.rootMargin ?? "0px", threshold: options?.threshold ?? 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [options?.rootMargin, options?.threshold])

  return { ref, inView }
}

const statsConfig = [
  { id: 1, key: "requests" as const, name: "今日请求数" },
  { id: 2, key: "tokens" as const, name: "今日处理 Token 总数" },
]

/** 大数用 万/百万/亿 显示，更有量感 */
function formatStatValue(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1).replace(/\.0$/, "") + "亿"
  if (n >= 10_000) return (n / 10_000).toFixed(1).replace(/\.0$/, "") + "万"
  return n.toLocaleString()
}

/**
 * 当日统计 - 仅当进入视口时数字才动态 count-up
 */
export function TodayStatsClassic() {
  const { ref, inView } = useInView()
  const [data, setData] = useState<{ requests: number; tokens: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/today")
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok) {
          setData({ requests: json.requests ?? 0, tokens: json.tokens ?? 0 })
        }
      })
      .catch(() => setData({ requests: 0, tokens: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const requests = data?.requests ?? 0
  const tokens = data?.tokens ?? 0
  const runCountUp = !loading && data != null && inView
  const displayRequests = useCountUp(requests, runCountUp)
  const displayTokens = useCountUp(tokens, runCountUp)

  const values = { requests: displayRequests, tokens: displayTokens }

  if (loading) {
    return (
      <div ref={ref} className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-2">
            {statsConfig.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-3">
                <dt className="text-xs text-gray-600">{stat.name}</dt>
                <dd className="order-first h-14 w-28 sm:h-16 sm:w-32 mx-auto bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-2">
          {statsConfig.map((stat) => (
            <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-3">
              <dt className="text-xs text-gray-600">{stat.name}</dt>
              <dd className="order-first text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl tabular-nums">
                {formatStatValue(values[stat.key])}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
