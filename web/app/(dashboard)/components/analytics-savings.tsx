"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank, Route, TrendingUp, Percent } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { useMemo } from "react"

interface SavingsData {
  total_saved: number
  routed_requests: number
  total_requests: number
  route_rate: number
  daily: Record<string, number>
}

interface AnalyticsSavingsProps {
  data: SavingsData | null
  loading: boolean
}

function SavingsTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      <p className="text-emerald-600">节省：¥{payload[0].value.toFixed(4)}</p>
    </div>
  )
}

export function AnalyticsSavings({ data, loading }: AnalyticsSavingsProps) {
  const chartData = useMemo(() => {
    if (!data?.daily) return []
    return Object.entries(data.daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, saved]) => ({
        date: date.slice(5),
        saved,
      }))
  }, [data])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">智能路由节省</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const cards = [
    {
      label: "累计节省",
      value: `¥${data.total_saved.toFixed(2)}`,
      icon: PiggyBank,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "智能路由次数",
      value: data.routed_requests.toLocaleString(),
      icon: Route,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "路由优化率",
      value: `${data.route_rate.toFixed(1)}%`,
      icon: Percent,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "总请求数",
      value: data.total_requests.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">{card.label}</span>
                <div className={`rounded-md p-1.5 ${card.bg}`}>
                  <card.icon className={`size-3.5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold tracking-tight text-card-foreground">{card.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 每日节省趋势图 */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">每日节省趋势</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {chartData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              暂无智能路由节省数据
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
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
                    tickFormatter={(v) => `¥${v.toFixed(2)}`}
                  />
                  <RechartsTooltip content={<SavingsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="saved"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#fillSaved)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
