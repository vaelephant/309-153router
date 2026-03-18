"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RECHARGE_AMOUNTS } from "../domain/recharge.types"
import { createRechargeOrderAction } from "../actions"
import { getCurrentUserId } from "@/lib/auth-client"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n-context"

interface RechargeFormProps {
  onOrderCreated: (order: {
    orderId: string
    bizOrderNo: string
    qrcodeUrl: string
    amount: number
    payProvider: 'WECHAT' | 'ALIPAY'
  }) => void
}

export function RechargeForm({ onOrderCreated }: RechargeFormProps) {
  const { t } = useI18n()
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [payProvider, setPayProvider] = useState<'WECHAT' | 'ALIPAY'>('WECHAT')
  const [loading, setLoading] = useState(false)

  const handlePresetAmount = (preset: number) => {
    setAmount(preset)
    setCustomAmount("")
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      setAmount(num)
    } else {
      setAmount(null)
    }
  }

  const handleSubmit = async () => {
    if (!amount || amount < RECHARGE_AMOUNTS.MIN || amount > RECHARGE_AMOUNTS.MAX) {
      toast.error(t("recharge.toastAmountError", { min: String(RECHARGE_AMOUNTS.MIN), max: String(RECHARGE_AMOUNTS.MAX) }))
      return
    }

    const userId = getCurrentUserId()
    if (!userId) {
      toast.error(t("recharge.toastPleaseLogin"))
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('amount', amount.toString())
      formData.append('payProvider', payProvider)
      formData.append('userId', userId)

      const result = await createRechargeOrderAction(null, formData)

      if (result.ok && result.data) {
        onOrderCreated(result.data)
        toast.success(t("recharge.toastOrderSuccess"))
      } else {
        toast.error(result.error || t("recharge.toastOrderFail"))
      }
    } catch (error) {
      console.error('Create order error:', error)
      toast.error(t("recharge.toastOrderFailRetry"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recharge.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>{t("recharge.amountLabel")}</Label>
          <div className="grid grid-cols-3 gap-3">
            {RECHARGE_AMOUNTS.PRESET.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? "default" : "outline"}
                onClick={() => handlePresetAmount(preset)}
                className="h-12"
              >
                ¥{preset}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-amount">{t("recharge.customAmount")}</Label>
            <Input
              id="custom-amount"
              type="number"
              placeholder={t("recharge.placeholder", { min: String(RECHARGE_AMOUNTS.MIN), max: String(RECHARGE_AMOUNTS.MAX) })}
              value={customAmount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              min={RECHARGE_AMOUNTS.MIN}
              max={RECHARGE_AMOUNTS.MAX}
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              {t("recharge.minMax", { min: String(RECHARGE_AMOUNTS.MIN), max: String(RECHARGE_AMOUNTS.MAX) })}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t("recharge.paymentMethod")}</Label>
          <RadioGroup value={payProvider} onValueChange={(v) => setPayProvider(v as 'WECHAT' | 'ALIPAY')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="WECHAT" id="wechat" />
              <Label htmlFor="wechat" className="cursor-pointer">
                {t("recharge.wechat")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ALIPAY" id="alipay" />
              <Label htmlFor="alipay" className="cursor-pointer">
                {t("recharge.alipay")}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!amount || loading}
          className="w-full"
          size="lg"
        >
          {loading ? t("recharge.creating") : `${t("recharge.confirm")} ¥${amount?.toFixed(2) || '0.00'}`}
        </Button>
      </CardContent>
    </Card>
  )
}
