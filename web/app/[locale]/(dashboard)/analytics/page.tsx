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
import { AnalyticsApiKeyRanking } from "../components/analytics-api-key-ranking"
import { AnalyticsApiKeyFilter, type ApiKeyOption } from "../components/analytics-api-key-filter"
import { AnalyticsFailureAlert } from "../components/analytics-failure-alert"
import { getCurrentUserId } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

export default function AnalyticsPage() {
  const { t, locale } = useI18n()
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
  const [apiKeysRank, setApiKeysRank] = useState(null)

  const [apiKeyId, setApiKeyId] = useState("")
  const [apiKeyOptions, setApiKeyOptions] = useState<ApiKeyOption[]>([])

  // 日志筛选
  const [logPage, setLogPage] = useState(1)
  const [logFilters, setLogFilters] = useState<{ model?: string; status?: string }>({})

  const buildQuery = useCallback((selectedDays: number, section: string, extra?: Record<string, string>) => {
    const params = new URLSearchParams({
      days: String(selectedDays),
      section,
    })
    if (apiKeyId) params.set("apiKeyId", apiKeyId)
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v) params.set(k, v)
      }
    }
    return params.toString()
  }, [apiKeyId])

  const fetchMainData = useCallback(async (selectedDays: number) => {
    const userId = getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // 并行请求所有数据（除了日志，日志单独请求支持分页）
      const sections = ['overview', 'trend', 'models', 'api_keys', 'tokens', 'savings']
      const results = await Promise.all(
        sections.map(section =>
          fetch(`/${locale}/api/analytics?${buildQuery(selectedDays, section)}`, {
            headers: { 'x-user-id': userId },
          }).then(r => r.json())
        )
      )

      setOverview(results[0]?.overview || null)
      setTrend(results[1]?.trend || null)
      setModels(results[2]?.models || null)
      setApiKeysRank(results[3]?.api_keys || null)
      setTokens(results[4]?.tokens || null)
      setSavings(results[5]?.savings || null)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [locale, buildQuery])

  const fetchLogs = useCallback(async (selectedDays: number, page: number, filters: { model?: string; status?: string }) => {
    const userId = getCurrentUserId()
    if (!userId) return

    setLogsLoading(true)
    try {
      const params = new URLSearchParams(buildQuery(selectedDays, 'logs', {
        page: String(page),
        pageSize: '20',
        ...(filters.model ? { model: filters.model } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      }))

      const response = await fetch(`/${locale}/api/analytics?${params.toString()}`, {
        headers: { 'x-user-id': userId },
      })
      const data = await response.json()
      setLogs(data?.logs || null)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }, [locale, buildQuery])

  useEffect(() => {
    async function loadKeyOptions() {
      const userId = getCurrentUserId()
      if (!userId) return
      try {
        const res = await fetch(`/${locale}/api/keys`, { headers: { 'x-user-id': userId } })
        const json = await res.json()
        const list = (json.data || []) as Array<{ id: string; name?: string | null; masked_key: string }>
        setApiKeyOptions(
          list.map((k) => ({
            id: k.id,
            label: k.name || k.masked_key,
          }))
        )
      } catch {
        setApiKeyOptions([])
      }
    }
    loadKeyOptions()
  }, [locale])

  // 主数据加载
  useEffect(() => {
    fetchMainData(days)
    fetchLogs(days, 1, {})
    setLogPage(1)
    setLogFilters({})
  }, [days, apiKeyId, fetchMainData, fetchLogs])

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
              <h1 className="text-lg font-semibold mb-1">{t("dashboard.analyticsTitle")}</h1>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.analyticsDesc")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AnalyticsApiKeyFilter
                value={apiKeyId}
                options={apiKeyOptions}
                onChange={setApiKeyId}
              />
              <AnalyticsTimeFilter days={days} onChange={handleDaysChange} />
            </div>
          </div>

          {/* 概览统计 */}
          <AnalyticsOverview data={overview} loading={loading} days={days} />

          <AnalyticsFailureAlert
            data={
              overview?.current
                ? {
                    error_count: overview.current.error_count ?? 0,
                    rate_limited_count: overview.current.rate_limited_count ?? 0,
                  }
                : null
            }
            onFilterStatus={(status) => handleFilterChange({ ...logFilters, status })}
          />

          {/* 趋势图 */}
          <AnalyticsTrendChart data={trend} loading={loading} days={days} />

          {/* Token 消耗分析 */}
          <AnalyticsTokenAnalysis data={tokens} loading={loading} />

          {/* 模型排行 */}
          <AnalyticsModelRanking data={models} loading={loading} />

          {/* API Key 排行 */}
          <AnalyticsApiKeyRanking data={apiKeysRank} loading={loading} />

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
