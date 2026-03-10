"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useMemo } from "react"

interface TokenData {
  [date: string]: { input: number; output: number; cost: number }
}

interface AnalyticsTokenAnalysisProps {
  data: TokenData | null
  loading: boolean
}

interface ChartItem {
  date: string
  input: number
  output: number
}

function TokenTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === "input" ? "输入 Token" : "输出 Token"}：{formatTokens(p.value)}
        </p>
      ))}
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

export function AnalyticsTokenAnalysis({ data, loading }: AnalyticsTokenAnalysisProps) {
  const chartData = useMemo(() => {
    if (!data) return []
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date: date.slice(5),
        input: d.input,
        output: d.output,
      }))
  }, [data])

  // 统计总量
  const totals = useMemo(() => {
    if (!data) return { input: 0, output: 0, ratio: 0 }
    let input = 0, output = 0
    Object.values(data).forEach((d) => {
      input += d.input
      output += d.output
    })
    const total = input + output
    return {
      input,
      output,
      ratio: total > 0 ? (output / input) : 0,
    }
  }, [data])

  const formatY = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
    return String(v)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Token 消耗分析</CardTitle>
          {!loading && data && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>输入：<span className="font-medium text-card-foreground">{formatTokens(totals.input)}</span></span>
              <span>输出：<span className="font-medium text-card-foreground">{formatTokens(totals.output)}</span></span>
              <span>输出/输入比：<span className="font-medium text-card-foreground">{totals.ratio.toFixed(2)}</span></span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#003153" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#003153" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9a9a9a" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9a9a9a" }}
                  tickFormatter={formatY}
                />
                <RechartsTooltip content={<TokenTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                  formatter={(value: string) => (value === "input" ? "输入 Token" : "输出 Token")}
                />
                <Area
                  type="monotone"
                  dataKey="input"
                  stroke="#003153"
                  strokeWidth={2}
                  fill="url(#fillInput)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#fillOutput)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
