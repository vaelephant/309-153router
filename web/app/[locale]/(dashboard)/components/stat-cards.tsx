"use client"

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, Zap, DollarSign, Clock, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUserId } from '@/lib/auth-client'
import { useI18n } from '@/lib/i18n-context'

interface Stats {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  description: string
  statKey?: string
}

function formatChange(pct: number, isLatency = false): { text: string; trend: 'up' | 'down' } {
  if (isLatency) {
    const sign = pct >= 0 ? '+' : ''
    return {
      text: `${sign}${pct.toFixed(1)}%`,
      trend: pct <= 0 ? 'down' : 'up',
    }
  }
  if (Math.abs(pct) < 0.05) {
    return { text: '—', trend: 'up' }
  }
  const sign = pct >= 0 ? '+' : ''
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    trend: pct >= 0 ? 'up' : 'down',
  }
}

function formatCost(cost: number): string {
  if (cost < 0.01 && cost > 0) return `¥${cost.toFixed(4)}`
  return `¥${cost.toFixed(2)}`
}

export function StatCards() {
  const { t, locale } = useI18n()
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)

  const getDefaultStats = (): Stats[] => [
    { label: t("dashboard.requestsToday"), value: '0', change: '—', trend: 'up', icon: Zap, description: t("dashboard.vsYesterday"), statKey: 'requests' },
    { label: t("dashboard.costToday"), value: '¥0.00', change: '—', trend: 'up', icon: DollarSign, description: t("dashboard.vsYesterday"), statKey: 'cost' },
    { label: t("dashboard.avgLatency"), value: '0ms', change: '—', trend: 'down', icon: Clock, description: t("dashboard.todayAvg"), statKey: 'latency' },
    { label: t("dashboard.successRate"), value: '0%', change: '—', trend: 'up', icon: Activity, description: t("dashboard.todayLabel"), statKey: 'success' },
  ]

  useEffect(() => {
    async function fetchStats() {
      const userId = getCurrentUserId()
      if (!userId) {
        setStats(getDefaultStats())
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/${locale}/api/usage?days=30`, {
          headers: { 'x-user-id': userId },
        })

        if (!response.ok) {
          setStats(getDefaultStats())
          setLoading(false)
          return
        }

        const data = await response.json()

        if (data.error || !data.today) {
          setStats(getDefaultStats())
          setLoading(false)
          return
        }

        const today = data.today
        const changes = data.today_changes || {}

        const reqCh = formatChange(changes.requests ?? 0)
        const costCh = formatChange(changes.cost ?? 0)
        const latCh = formatChange(changes.latency ?? 0, true)
        const successDiff = changes.success_rate ?? 0
        const successCh = {
          text: Math.abs(successDiff) < 0.05 ? '—' : `${successDiff >= 0 ? '+' : ''}${successDiff.toFixed(1)}pp`,
          trend: (successDiff >= 0 ? 'up' : 'down') as 'up' | 'down',
        }

        setStats([
          {
            label: t("dashboard.requestsToday"),
            value: today.total_requests.toLocaleString(),
            change: reqCh.text,
            trend: reqCh.trend,
            icon: Zap,
            description: t("dashboard.vsYesterday"),
            statKey: 'requests',
          },
          {
            label: t("dashboard.costToday"),
            value: formatCost(today.total_cost),
            change: costCh.text,
            trend: costCh.trend,
            icon: DollarSign,
            description: t("dashboard.vsYesterday"),
            statKey: 'cost',
          },
          {
            label: t("dashboard.avgLatency"),
            value: `${(today.avg_latency_ms || 0).toLocaleString()}ms`,
            change: latCh.text,
            trend: latCh.trend,
            icon: Clock,
            description: t("dashboard.todayAvg"),
            statKey: 'latency',
          },
          {
            label: t("dashboard.successRate"),
            value: `${Number(today.success_rate || 0).toFixed(1)}%`,
            change: successCh.text,
            trend: successCh.trend,
            icon: Activity,
            description: t("dashboard.todayLabel"),
            statKey: 'success',
          },
        ])
      } catch {
        setStats(getDefaultStats())
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [locale, t])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="mt-3 h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="mt-2 h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                <stat.icon className="size-4 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-card-foreground">
                {stat.value}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  stat.statKey === 'latency'
                    ? stat.trend === 'down'
                      ? 'text-success'
                      : 'text-chart-5'
                    : stat.trend === 'up'
                    ? 'text-success'
                    : 'text-chart-5'
                }`}
              >
                {stat.change !== '—' && (
                  stat.trend === 'up' ? (
                    <ArrowUpRight className="mr-0.5 size-3" />
                  ) : (
                    <ArrowDownRight className="mr-0.5 size-3" />
                  )
                )}
                {stat.change}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
