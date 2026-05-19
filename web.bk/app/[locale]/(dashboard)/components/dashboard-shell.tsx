"use client"

import { StatCards } from "./stat-cards"
import { UsageChart } from "./usage-chart"
import { ModelUsage } from "./model-usage"
import { ProviderUsage } from "./provider-usage"
import { ActivityLog } from "./activity-log"
import { QuickStart } from "./quick-start"
import { PopularModels } from "./popular-models"

export function DashboardShell() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Stats */}
        <StatCards />

        {/* 用量折线图 */}
        <UsageChart />

        {/* 两个饼图：模型使用分布 + 供应商使用分布 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ModelUsage />
          <ProviderUsage />
        </div>

        {/* 最近请求 */}
        <ActivityLog />

        {/* Models table */}
        <PopularModels />

        {/* Quick start */}
        <QuickStart />
      </div>
    </div>
  )
}
