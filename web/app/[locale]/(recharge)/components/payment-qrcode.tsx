"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, X, CheckCircle2, Clock } from "lucide-react"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n-context"
import type { CreateRechargeOrderResult } from "../domain/recharge.types"

/** 倒计时总秒数：10 分钟 */
const COUNTDOWN_SECONDS = 10 * 60
/** 轮询间隔：3 秒 */
const POLL_INTERVAL_MS = 3000

interface PaymentQrcodeProps {
  order: Pick<
    CreateRechargeOrderResult,
    'orderId' | 'bizOrderNo' | 'qrcodeUrl' | 'amount' | 'payProvider'
  >
  onClose: () => void
}

export function PaymentQrcode({ order, onClose }: PaymentQrcodeProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)
  const [paid, setPaid] = useState(false)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goToDashboard = (reason: 'paid' | 'timeout') => {
    stopTimers()
    if (reason === 'paid') {
      toast.success(t("recharge.toastRechargeSuccess"))
    } else {
      toast.info(t("recharge.toastTimeout"))
    }
    router.push(`/${locale}/dashboard`)
  }

  const stopTimers = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
  }

  // 轮询支付状态
  const pollStatus = async () => {
    try {
      const res = await fetch(`/${locale}/api/recharge/orders/${order.orderId}/status`)
      if (!res.ok) return
      const json = await res.json()
      if (json.ok && json.data?.paid) {
        setPaid(true)
        setTimeout(() => goToDashboard('paid'), 1500) // 给用户看一下成功状态再跳转
      }
    } catch {
      // 网络错误，忽略，等下次轮询
    }
  }

  useEffect(() => {
    // 启动倒计时
    countdownTimerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          goToDashboard('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 立即查一次，再每 3 秒查
    pollStatus()
    pollTimerRef.current = setInterval(pollStatus, POLL_INTERVAL_MS)

    return () => stopTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderId])

  // 格式化剩余时间 mm:ss
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  const providerName =
    order.payProvider === 'WECHAT'
      ? t("recharge.wechatShort")
      : order.payProvider === 'ALIPAY'
        ? t("recharge.alipayShort")
        : t("recharge.stripeShort")
  const timeStr = `${minutes}:${seconds}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("recharge.scanPay")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
            {t("recharge.payAmount")}：¥{order.amount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("recharge.scanWith", { provider: providerName })}
          </p>
        </div>

        <div className="flex justify-center p-4 bg-muted rounded-lg relative">
          {order.qrcodeUrl ? (
            <div className="bg-white p-3 rounded">
              <QRCode value={order.qrcodeUrl} size={220} />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed rounded">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {paid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-lg gap-2">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-base font-semibold text-green-600">{t("recharge.paySuccess")}</p>
              <p className="text-sm text-muted-foreground">{t("recharge.redirecting")}</p>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <div className={`flex items-center justify-center gap-1 text-sm text-muted-foreground ${secondsLeft <= 60 ? 'text-destructive font-semibold' : ''}`}>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{t("recharge.completeWithin", { time: timeStr })}</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("recharge.balanceAuto")}
          </p>
          <Button variant="outline" onClick={onClose} className="w-full">
            {t("recharge.cancelPay")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
