"use client"

import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { BillingHistory } from "../components/billing-history"
import { useI18n } from "@/lib/i18n-context"

export default function BillingPage() {
  const { t } = useI18n()
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">{t("billing.title")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("billing.subtitle")}
            </p>
          </div>
          <BillingHistory />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
