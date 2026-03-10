"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { AnalyticsTimeFilter } from "../components/analytics-time-filter"
import { AnalyticsOverview } from "../components/analytics-overview"
import { AnalyticsTrendChart } from "../components/analytics-trend-chart"
import { AnalyticsModelRanking } from "../components/analytics-model-ranking"
import { AnalyticsRequestLog } from "../components/analytics-request-log"
import { AnalyticsTokenAnalysis } from "../components/analytics-token-analysis"
import { AnalyticsSavings } from "../components/analytics-savings"
import { getCurrentUserId } from "@/lib/auth-client"

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)

  // 数据状态
  const [overview, setOverview] = useState(null)
  const [trend, setTrend] = useState(null)
  const [models, setModels] = useState(null)
  const [logs, setLogs] = useState(null)
  const [tokens, setTokens] = useState(null)
  const [savings, setSavings] = useState(null)

  // 日志筛选
  const [logPage, setLogPage] = useState(1)
  const [logFilters, setLogFilters] = useState<{ model?: string; status?: string }>({})

  const fetchMainData = useCallback(async (selectedDays: number) => {
    const userId = getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // 并行请求所有数据（除了日志，日志单独请求支持分页）
      const sections = ['overview', 'trend', 'models', 'tokens', 'savings']
      const results = await Promise.all(
        sections.map(section =>
          fetch(`/api/analytics?days=${selectedDays}&section=${section}`, {
            headers: { 'x-user-id': userId },
          }).then(r => r.json())
        )
      )

      setOverview(results[0]?.overview || null)
      setTrend(results[1]?.trend || null)
      setModels(results[2]?.models || null)
      setTokens(results[3]?.tokens || null)
      setSavings(results[4]?.savings || null)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async (selectedDays: number, page: number, filters: { model?: string; status?: string }) => {
    const userId = getCurrentUserId()
    if (!userId) return

    setLogsLoading(true)
    try {
      const params = new URLSearchParams({
        days: String(selectedDays),
        section: 'logs',
        page: String(page),
        pageSize: '20',
      })
      if (filters.model) params.set('model', filters.model)
      if (filters.status) params.set('status', filters.status)

      const response = await fetch(`/api/analytics?${params.toString()}`, {
        headers: { 'x-user-id': userId },
      })
      const data = await response.json()
      setLogs(data?.logs || null)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }, [])

  // 主数据加载
  useEffect(() => {
    fetchMainData(days)
    fetchLogs(days, 1, {})
    setLogPage(1)
    setLogFilters({})
  }, [days, fetchMainData, fetchLogs])

  // 日志分页/筛选变化
  useEffect(() => {
    fetchLogs(days, logPage, logFilters)
  }, [logPage, logFilters, days, fetchLogs])

  const handleDaysChange = (newDays: number) => {
    setDays(newDays)
  }

  const handlePageChange = (page: number) => {
    setLogPage(page)
  }

  const handleFilterChange = (filters: { model?: string; status?: string }) => {
    setLogFilters(filters)
    setLogPage(1) // 筛选变化时重置到第一页
  }

  // 从模型数据中提取可用模型列表
  const availableModels = (models as Array<{ name: string }> | null)?.map((m) => m.name) || []

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* 标题 + 时间筛选 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold mb-1">用量分析</h1>
              <p className="text-xs text-muted-foreground">
                查看详细的 API 使用统计和分析
              </p>
            </div>
            <AnalyticsTimeFilter days={days} onChange={handleDaysChange} />
          </div>

          {/* 概览统计 */}
          <AnalyticsOverview data={overview} loading={loading} days={days} />

          {/* 趋势图 */}
          <AnalyticsTrendChart data={trend} loading={loading} days={days} />

          {/* Token 消耗分析 */}
          <AnalyticsTokenAnalysis data={tokens} loading={loading} />

          {/* 模型排行 */}
          <AnalyticsModelRanking data={models} loading={loading} />

          {/* 智能路由节省 */}
          <AnalyticsSavings data={savings} loading={loading} />

          {/* 请求明细日志 */}
          <AnalyticsRequestLog
            data={logs}
            loading={logsLoading}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            filters={logFilters}
            availableModels={availableModels}
          />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
