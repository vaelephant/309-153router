"use client"

import { DashboardLayout } from "../../(dashboard)/components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { ApiKeys } from "../../(dashboard)/components/api-keys"
import { useI18n } from "@/lib/i18n-context"

export default function KeysPage() {
  const { t } = useI18n()
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">{t("dashboard.apiKeysTitle")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.manageApiKeys")}
            </p>
          </div>
          <ApiKeys />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
