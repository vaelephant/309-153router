"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { DashboardLayout } from "../../(dashboard)/components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { RechargeForm } from "../components/recharge-form"
import { PaymentQrcode } from "../components/payment-qrcode"
import { StripeChargePending } from "../components/stripe-charge-pending"
import { useI18n } from "@/lib/i18n-context"
import type { CreateRechargeOrderResult } from "../domain/recharge.types"

export default function RechargePage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<CreateRechargeOrderResult | null>(null)

  useEffect(() => {
    const stripe = searchParams.get('stripe')
    if (stripe === 'success') {
      toast.success(t('recharge.stripeReturnSuccess'))
    } else if (stripe === 'cancel') {
      toast.info(t('recharge.stripeReturnCancel'))
    }
    if (stripe) {
      const url = new URL(window.location.href)
      url.searchParams.delete('stripe')
      url.searchParams.delete('session_id')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [searchParams, t])

  const handleOrderCreated = (newOrder: CreateRechargeOrderResult) => {
    if (newOrder.payProvider === 'STRIPE') {
      if (newOrder.payUrl) {
        window.location.href = newOrder.payUrl
        return
      }
      if (newOrder.stripeChargeStatus === 'succeeded' && newOrder.paid) {
        toast.success(t('recharge.toastRechargeSuccess'))
        router.push(`/${locale}/dashboard`)
        return
      }
      setOrder(newOrder)
      return
    }
    setOrder(newOrder)
  }

  const handleClose = () => setOrder(null)

  const renderOrderView = () => {
    if (!order) return null
    if (order.payProvider === 'STRIPE') {
      return <StripeChargePending order={order} onClose={handleClose} />
    }
    return <PaymentQrcode order={order} onClose={handleClose} />
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">{t("recharge.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("recharge.subtitle")}</p>
          </div>

          {order ? renderOrderView() : <RechargeForm onOrderCreated={handleOrderCreated} />}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
