"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useState, useMemo } from "react"

interface TrendData {
  current: Record<string, { requests: number; tokens: number; cost: number; input_tokens: number; output_tokens: number }>
  previous: Record<string, { requests: number; tokens: number; cost: number; input_tokens: number; output_tokens: number }>
}

interface AnalyticsTrendChartProps {
  data: TrendData | null
  loading: boolean
  days: number
}

interface ChartItem {
  date: string
  current: number
  previous: number
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-popover-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.dataKey === "current" ? "本期" : "上期"}：{formatValue(p.value)}
        </p>
      ))}
    </div>
  )
}

function formatValue(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toLocaleString()
}

export function AnalyticsTrendChart({ data, loading, days }: AnalyticsTrendChartProps) {
  const [metric, setMetric] = useState<"requests" | "tokens" | "cost">("requests")

  const chartData = useMemo(() => {
    if (!data) return []

    const currentEntries = Object.entries(data.current).sort(([a], [b]) => a.localeCompare(b))
    const prevMap = data.previous

    // 将上期数据按日期偏移映射到同一天
    const prevEntries = Object.entries(prevMap).sort(([a], [b]) => a.localeCompare(b))

    const result: ChartItem[] = currentEntries.map(([date, d], index) => {
      const prevEntry = prevEntries[index]
      return {
        date: date.slice(5), // MM-DD
        current: d[metric],
        previous: prevEntry ? prevEntry[1][metric] : 0,
      }
    })

    return result
  }, [data, metric])

  const formatY = (v: number) => {
    if (metric === "cost") {
      if (v < 0.01 && v > 0) return `¥${v.toFixed(4)}`
      return `¥${v.toFixed(2)}`
    }
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
    return String(v)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          用量趋势（含上期对比）
        </CardTitle>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
          <TabsList className="h-7 bg-secondary">
            <TabsTrigger value="requests" className="text-[11px] h-5 px-2.5">请求数</TabsTrigger>
            <TabsTrigger value="tokens" className="text-[11px] h-5 px-2.5">Token</TabsTrigger>
            <TabsTrigger value="cost" className="text-[11px] h-5 px-2.5">费用</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#003153" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#003153" stopOpacity={0.02} />
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
                <RechartsTooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                  formatter={(value: string) => (value === "current" ? "本期" : "上期")}
                />
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#003153"
                  strokeWidth={2}
                  fill="url(#fillCurrent)"
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
