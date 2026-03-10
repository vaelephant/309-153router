"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Zap, DollarSign, Clock, Activity, Hash, PiggyBank } from "lucide-react"

interface OverviewData {
  current: {
    total_requests: number
    total_input_tokens: number
    total_output_tokens: number
    total_tokens: number
    total_cost: number
    total_saved_cost: number
    avg_latency_ms: number
    success_rate: number
  }
  changes: {
    requests: number
    tokens: number
    cost: number
    latency: number
    success_rate: number
    saved_cost: number
  }
}

interface AnalyticsOverviewProps {
  data: OverviewData | null
  loading: boolean
  days: number
}

export function AnalyticsOverview({ data, loading, days }: AnalyticsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="mt-2 h-7 w-24 bg-muted animate-pulse rounded" />
              <div className="mt-2 h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const { current, changes } = data

  const cards = [
    {
      label: "总请求数",
      value: current.total_requests.toLocaleString(),
      change: changes.requests,
      icon: Zap,
      lowerBetter: false,
    },
    {
      label: "总 Token 数",
      value: current.total_tokens >= 1000000
        ? `${(current.total_tokens / 1000000).toFixed(2)}M`
        : current.total_tokens >= 1000
        ? `${(current.total_tokens / 1000).toFixed(1)}K`
        : current.total_tokens.toLocaleString(),
      change: changes.tokens,
      icon: Hash,
      lowerBetter: false,
      subtitle: `输入 ${formatTokens(current.total_input_tokens)} / 输出 ${formatTokens(current.total_output_tokens)}`,
    },
    {
      label: "总费用",
      value: `¥${current.total_cost < 0.01 && current.total_cost > 0 ? current.total_cost.toFixed(4) : current.total_cost.toFixed(2)}`,
      change: changes.cost,
      icon: DollarSign,
      lowerBetter: true,
    },
    {
      label: "平均延迟",
      value: `${current.avg_latency_ms.toLocaleString()}ms`,
      change: changes.latency,
      icon: Clock,
      lowerBetter: true,
    },
    {
      label: "成功率",
      value: `${current.success_rate.toFixed(1)}%`,
      change: changes.success_rate,
      icon: Activity,
      lowerBetter: false,
      isPercentChange: true,
    },
    {
      label: "智能路由节省",
      value: `¥${current.total_saved_cost.toFixed(2)}`,
      change: changes.saved_cost,
      icon: PiggyBank,
      lowerBetter: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const isPositive = card.lowerBetter ? card.change <= 0 : card.change >= 0
        const changeText = card.isPercentChange
          ? `${card.change >= 0 ? "+" : ""}${card.change.toFixed(1)}%`
          : `${card.change >= 0 ? "+" : ""}${card.change.toFixed(1)}%`

        return (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {card.label}
                </span>
                <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                  <card.icon className="size-3.5 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold tracking-tight text-card-foreground">
                  {card.value}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center text-[10px] font-medium ${
                    isPositive ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="mr-0.5 size-2.5" />
                  ) : (
                    <ArrowDownRight className="mr-0.5 size-2.5" />
                  )}
                  {changeText}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  vs 前 {days} 天
                </span>
              </div>
              {card.subtitle && (
                <p className="mt-1 text-[10px] text-muted-foreground">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}
