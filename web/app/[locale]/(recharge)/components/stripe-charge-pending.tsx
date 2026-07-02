"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n-context"
import type { CreateRechargeOrderResult } from "../domain/recharge.types"
import { formatRechargeMoney } from "../domain/recharge.types"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

const POLL_INTERVAL_MS = 3000
const COUNTDOWN_SECONDS = 10 * 60

interface StripeChargePendingProps {
  order: Pick<
    CreateRechargeOrderResult,
    'orderId' | 'bizOrderNo' | 'amount' | 'clientSecret' | 'requiresAction'
  >
  onClose: () => void
}

export function StripeChargePending({ order, onClose }: StripeChargePendingProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)
  const [paid, setPaid] = useState(false)
  const [confirming3ds, setConfirming3ds] = useState(Boolean(order.requiresAction && order.clientSecret))
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const threeDsStartedRef = useRef(false)

  const stopTimers = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
  }

  const goToDashboard = (reason: 'paid' | 'timeout') => {
    stopTimers()
    if (reason === 'paid') {
      toast.success(t("recharge.toastRechargeSuccess"))
    } else {
      toast.info(t("recharge.toastTimeout"))
    }
    router.push(`/${locale}/dashboard`)
  }

  const pollStatus = async () => {
    try {
      const res = await fetch(`/${locale}/api/recharge/orders/${order.orderId}/status`)
      if (!res.ok) return
      const json = await res.json()
      if (json.ok && json.data?.paid) {
        setPaid(true)
        setTimeout(() => goToDashboard('paid'), 1500)
      }
    } catch {
      // ignore, retry on next poll
    }
  }

  useEffect(() => {
    if (!order.requiresAction || !order.clientSecret || threeDsStartedRef.current) return
    if (!stripePromise) {
      toast.error(t("recharge.stripeNotConfigured"))
      onClose()
      return
    }

    threeDsStartedRef.current = true
    let cancelled = false

    ;(async () => {
      const stripe = await stripePromise
      if (!stripe || cancelled) return

      const { error } = await stripe.confirmCardPayment(order.clientSecret!)
      if (cancelled) return

      setConfirming3ds(false)
      if (error) {
        toast.error(error.message ?? t("recharge.stripe3dsFail"))
        onClose()
        return
      }

      toast.success(t("recharge.stripe3dsSuccess"))
      pollStatus()
    })()

    return () => {
      cancelled = true
    }
  }, [order.clientSecret, order.requiresAction, onClose, t])

  useEffect(() => {
    if (confirming3ds) return

    countdownTimerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          goToDashboard('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    pollStatus()
    pollTimerRef.current = setInterval(pollStatus, POLL_INTERVAL_MS)

    return () => stopTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderId, confirming3ds])

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const timeStr = `${minutes}:${seconds}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("recharge.stripeChargeTitle")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={confirming3ds}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("recharge.orderNo")}：{order.bizOrderNo}
          </p>
          <p className="text-2xl font-bold">
            {t("recharge.payAmount")}：{formatRechargeMoney('STRIPE', order.amount)}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-muted p-8">
          {confirming3ds ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("recharge.stripe3dsConfirming")}</p>
            </>
          ) : paid ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-base font-semibold text-green-600">{t("recharge.paySuccess")}</p>
              <p className="text-sm text-muted-foreground">{t("recharge.redirecting")}</p>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("recharge.stripeChargeProcessing")}</p>
            </>
          )}
        </div>

        {!confirming3ds && (
          <div className="text-center space-y-2">
            <div
              className={`flex items-center justify-center gap-1 text-sm text-muted-foreground ${
                secondsLeft <= 60 ? 'text-destructive font-semibold' : ''
              }`}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{t("recharge.completeWithin", { time: timeStr })}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("recharge.balanceAuto")}</p>
            <Button variant="outline" onClick={onClose} className="w-full">
              {t("recharge.cancelPay")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
