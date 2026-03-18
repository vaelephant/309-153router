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
} from "recharts"
import { useState, useEffect } from "react"
import { getDailyStats } from "@/lib/api/invite"
import { useI18n } from "@/lib/i18n-context"

interface DailyData {
  date: string
  count: number
}

function ChartTooltip({
  active,
  payload,
  label,
  inviteCountLabel,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  inviteCountLabel: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-popover-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{inviteCountLabel}: {payload[0].value}</p>
    </div>
  )
}

export function InviteChart() {
  const { t, locale } = useI18n()
  const [data, setData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(14)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const raw = await getDailyStats(days, locale)
        const byDate = new Map<string, number>()
        const start = new Date()
        start.setDate(start.getDate() - days + 1)
        for (let i = 0; i < days; i++) {
          const d = new Date(start)
          d.setDate(d.getDate() + i)
          const key = d.toISOString().split("T")[0]
          byDate.set(key, 0)
        }
        raw.forEach(({ date, count }) => byDate.set(date, count))
        const chartData: DailyData[] = Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({
            date: date.slice(5),
            count,
          }))
        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch invite daily stats:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days, locale])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {t("invite.chartTitle")}
        </CardTitle>
        <div className="flex gap-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {d}{t("invite.daysSuffix")}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            {t("invite.noData")}
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="inviteChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#003153" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#003153" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e6e6e6"
                  vertical={false}
                />
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
                  allowDecimals={false}
                />
                <RechartsTooltip content={<ChartTooltip inviteCountLabel={t("invite.chartInviteCount")} />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name={t("invite.chartInviteCount")}
                  stroke="#003153"
                  strokeWidth={2}
                  fill="url(#inviteChartFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
