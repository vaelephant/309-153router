"use client"

import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { BillingHistory } from "../components/billing-history"
import { BillingPaymentMethods } from "../components/billing-payment-methods"
import { useI18n } from "@/lib/i18n-context"
import { LocaleLink } from "@/components/locale-link"
import { Button } from "@/components/ui/button"

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
          <div className="mb-6">
            <BillingPaymentMethods />
          </div>
          <BillingHistory />
          <div className="mt-4">
            <Button variant="link" className="h-auto p-0 text-xs" asChild>
              <LocaleLink href="/billing/payment-methods">{t("billing.managePaymentMethods")}</LocaleLink>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
