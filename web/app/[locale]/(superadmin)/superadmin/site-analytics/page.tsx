"use client"

import { useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { DashboardLayout } from "@/app/(dashboard)/components/dashboard-layout"
import { AuthGuard } from "@/app/(auth)/components/auth-guard"
import { SuperadminGuard } from "@/app/(superadmin)/components/superadmin-guard"
import { SuperadminNav } from "@/app/(superadmin)/components/superadmin-nav"
import { getAuthHeaders } from "@/lib/auth-client"
import { Eye, Users, TrendingUp, Calendar, RefreshCw } from "lucide-react"

interface DailyStat {
  date: string
  views: number
  uniqueVisitors: number
}

interface PageStat {
  date: string
  path: string
  views: number
  uniqueVisitors: number
}

interface AnalyticsData {
  pageStats: PageStat[]
  chartData: DailyStat[]
  stats: {
    today: { views: number; uniqueVisitors: number }
    yesterday: { views: number; uniqueVisitors: number }
    last7Days: { views: number; uniqueVisitors: number }
    last30Days: { views: number; uniqueVisitors: number }
  }
}

const defaultData: AnalyticsData = {
  pageStats: [],
  chartData: [],
  stats: {
    today: { views: 0, uniqueVisitors: 0 },
    yesterday: { views: 0, uniqueVisitors: 0 },
    last7Days: { views: 0, uniqueVisitors: 0 },
    last30Days: { views: 0, uniqueVisitors: 0 },
  },
}

export default function SiteAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultData)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/site-analytics/stats", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      setAnalytics({
        pageStats: data.pageStats || [],
        chartData: data.chartData || [],
        stats: {
          today: {
            views: data.stats?.today?.views || 0,
            uniqueVisitors: data.stats?.today?.uniqueVisitors || 0,
          },
          yesterday: {
            views: data.stats?.yesterday?.views || 0,
            uniqueVisitors: data.stats?.yesterday?.uniqueVisitors || 0,
          },
          last7Days: {
            views: data.stats?.last7Days?.views || 0,
            uniqueVisitors: data.stats?.last7Days?.uniqueVisitors || 0,
          },
          last30Days: {
            views: data.stats?.last30Days?.views || 0,
            uniqueVisitors: data.stats?.last30Days?.uniqueVisitors || 0,
          },
        },
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStat = (
    period: keyof typeof analytics.stats,
    field: "views" | "uniqueVisitors"
  ) => analytics.stats?.[period]?.[field] || 0

  const summaryCards = [
    {
      title: "今日",
      views: getStat("today", "views"),
      visitors: getStat("today", "uniqueVisitors"),
      icon: Eye,
      color: "#003153",
    },
    {
      title: "昨日",
      views: getStat("yesterday", "views"),
      visitors: getStat("yesterday", "uniqueVisitors"),
      icon: Calendar,
      color: "#004a7c",
    },
    {
      title: "近 7 天",
      views: getStat("last7Days", "views"),
      visitors: getStat("last7Days", "uniqueVisitors"),
      icon: TrendingUp,
      color: "#0063a5",
    },
    {
      title: "近 30 天",
      views: getStat("last30Days", "views"),
      visitors: getStat("last30Days", "uniqueVisitors"),
      icon: Users,
      color: "#007cd0",
    },
  ]

  return (
    <AuthGuard>
      <SuperadminGuard>
        <DashboardLayout>
          <SuperadminNav />
          <div className="space-y-6">
            {/* 标题栏 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">网站流量统计</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  实时监控网站访问量与独立访客数据
                </p>
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#003153" }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                刷新
              </button>
            </div>

            {/* 汇总卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className="rounded-xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </span>
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: card.color + "18" }}
                      >
                        <Icon className="h-4 w-4" style={{ color: card.color }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{card.views.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">访问量</p>
                    </div>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      <p className="text-lg font-semibold" style={{ color: card.color }}>
                        {card.visitors.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">独立访客</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 趋势图表 */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">访问趋势</h2>
              {analytics.chartData.length > 0 ? (
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#888", fontSize: 12 }}
                        tickFormatter={(v) => {
                          const d = new Date(v)
                          return `${d.getMonth() + 1}/${d.getDate()}`
                        }}
                      />
                      <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="views"
                        name="访问量"
                        stroke="#003153"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#003153" }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uniqueVisitors"
                        name="独立访客"
                        stroke="#00a67e"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#00a67e" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  暂无趋势数据
                </div>
              )}
            </div>

            {/* 详细数据表格 */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-6 pb-3">
                <h2 className="text-lg font-semibold">页面访问明细</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  按日期和页面路径统计的详细数据
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-b bg-muted/30">
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">日期</th>
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">页面</th>
                      <th className="px-6 py-3 text-right font-medium text-muted-foreground">访问量</th>
                      <th className="px-6 py-3 text-right font-medium text-muted-foreground">独立访客</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.pageStats.length > 0 ? (
                      analytics.pageStats.map((row, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-6 py-3 text-muted-foreground">{row.date}</td>
                          <td className="px-6 py-3 font-mono text-xs">{row.path}</td>
                          <td className="px-6 py-3 text-right font-medium">{row.views}</td>
                          <td className="px-6 py-3 text-right" style={{ color: "#003153" }}>
                            {row.uniqueVisitors}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          暂无访问数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </SuperadminGuard>
    </AuthGuard>
  )
}
