"use client"

import { useState } from "react"
import { DashboardLayout } from "../../(dashboard)/components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { RechargeForm } from "../components/recharge-form"
import { PaymentQrcode } from "../components/payment-qrcode"
import { useI18n } from "@/lib/i18n-context"

export default function RechargePage() {
  const { t } = useI18n()
  const [order, setOrder] = useState<{
    orderId: string
    bizOrderNo: string
    qrcodeUrl: string
    amount: number
    payProvider: 'WECHAT' | 'ALIPAY'
  } | null>(null)

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">{t("recharge.title")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("recharge.subtitle")}
            </p>
          </div>

          {order ? (
            <PaymentQrcode
              order={order}
              onClose={() => setOrder(null)}
            />
          ) : (
            <RechargeForm
              onOrderCreated={(newOrder) => setOrder(newOrder)}
            />
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
