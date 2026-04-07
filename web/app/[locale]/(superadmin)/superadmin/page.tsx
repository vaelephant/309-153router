"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/[locale]/(dashboard)/components/dashboard-layout"
import { AuthGuard } from "@/app/[locale]/(auth)/components/auth-guard"
import { SuperadminGuard } from "@/app/[locale]/(superadmin)/components/superadmin-guard"
import { SuperadminNav } from "@/app/[locale]/(superadmin)/components/superadmin-nav"
import { TodayStatsClassic } from "@/components/today-stats-classic"
import { OverviewCards } from "@/app/[locale]/(superadmin)/components/overview-cards"
import { ModelTable } from "@/app/[locale]/(superadmin)/components/model-table"
import { ModelBarCharts } from "@/app/[locale]/(superadmin)/components/model-bar-charts"
import { ModelDailyTrendCharts } from "@/app/[locale]/(superadmin)/components/model-daily-trend-charts"
import { getAuthHeaders } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"
import type { SuperadminOverview, ModelsListResponse } from "@/app/[locale]/(superadmin)/domain/superadmin.types"
import type { ModelDailyStats } from "@/app/[locale]/(superadmin)/domain/superadmin.types"

export default function SuperadminDashboardPage() {
  const { locale } = useI18n()
  const [overview, setOverview] = useState<SuperadminOverview | null>(null)
  const [modelsData, setModelsData] = useState<ModelsListResponse | null>(null)
  const [dailyStats, setDailyStats] = useState<ModelDailyStats[]>([])
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingModels, setLoadingModels] = useState(true)
  const [loadingDaily, setLoadingDaily] = useState(true)

  useEffect(() => {
    fetch(`/${locale}/api/superadmin/overview`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setOverview(json.data)
      })
      .catch(console.error)
      .finally(() => setLoadingOverview(false))
  }, [locale])

  useEffect(() => {
    fetch(`/${locale}/api/superadmin/models`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setModelsData(json.data)
      })
      .catch(console.error)
      .finally(() => setLoadingModels(false))
  }, [locale])

  useEffect(() => {
    fetch(`/${locale}/api/superadmin/models/stats?days=30`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.daily) setDailyStats(json.data.daily)
      })
      .catch(console.error)
      .finally(() => setLoadingDaily(false))
  }, [locale])

  return (
    <AuthGuard>
      <SuperadminGuard>
        <DashboardLayout>
        <div className="p-6 space-y-6">
          <SuperadminNav />
          <TodayStatsClassic />
          <div>
            <h1 className="text-lg font-semibold mb-1">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              模型基本信息与用量统计
            </p>
          </div>
          <OverviewCards data={overview} loading={loadingOverview} />
          <ModelBarCharts
            usageStats={modelsData?.usageStats ?? []}
            loading={loadingModels}
          />
          <ModelDailyTrendCharts daily={dailyStats} loading={loadingDaily} />
          <ModelTable
            pricing={modelsData?.pricing ?? []}
            usageStats={modelsData?.usageStats ?? []}
            gatewayModels={modelsData?.gatewayModels ?? []}
            loading={loadingModels}
          />
        </div>
      </DashboardLayout>
      </SuperadminGuard>
    </AuthGuard>
  )
}
