"use client"

import { StatCards } from "./stat-cards"
import { UsageChart } from "./usage-chart"
import { ModelUsage } from "./model-usage"
import { ProviderUsage } from "./provider-usage"
import { ActivityLog } from "./activity-log"
import { QuickStart } from "./quick-start"
import { PopularModels } from "./popular-models"
import { DashboardOnboarding } from "./dashboard-onboarding"

export function DashboardShell() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <DashboardOnboarding />
        <StatCards />
        <UsageChart />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ModelUsage />
          <ProviderUsage />
        </div>
        <ActivityLog />
        <PopularModels />
        <QuickStart />
      </div>
    </div>
  )
}
