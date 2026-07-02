"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  RECHARGE_AMOUNTS,
  formatRechargeMoney,
  stripeUsdToCreditCny,
  type CreateRechargeOrderResult,
  type PayProvider,
} from "../domain/recharge.types"
import { createRechargeOrderAction } from "../actions"
import { getAuthHeaders, getCurrentUserId } from "@/lib/auth-client"
import { LocaleLink } from "@/components/locale-link"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n-context"
import { CreditCard } from "lucide-react"

interface StripeCardPreview {
  brand: string | null
  last4: string | null
}

interface RechargeFormProps {
  onOrderCreated: (order: CreateRechargeOrderResult) => void
}

export function RechargeForm({ onOrderCreated }: RechargeFormProps) {
  const { t, locale } = useI18n()
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [payProvider, setPayProvider] = useState<PayProvider>('WECHAT')
  const [loading, setLoading] = useState(false)
  const [stripeCard, setStripeCard] = useState<StripeCardPreview | null>(null)
  const [stripeCardLoading, setStripeCardLoading] = useState(false)

  const isStripe = payProvider === 'STRIPE'
  const minAmount = isStripe ? RECHARGE_AMOUNTS.STRIPE_MIN : RECHARGE_AMOUNTS.MIN
  const maxAmount = isStripe ? RECHARGE_AMOUNTS.STRIPE_MAX : RECHARGE_AMOUNTS.MAX
  const presets = isStripe ? RECHARGE_AMOUNTS.STRIPE_PRESET : RECHARGE_AMOUNTS.PRESET
  const moneySymbol = isStripe ? '$' : '¥'

  useEffect(() => {
    const userId = getCurrentUserId()
    if (!isStripe || !userId) {
      setStripeCard(null)
      return
    }

    let cancelled = false
    setStripeCardLoading(true)

    fetch('/api/billing/payment-methods', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.ok) return
        const items = (json.data?.items ?? []) as Array<{
          brand: string | null
          last4: string | null
          isDefault: boolean
        }>
        const def = items.find((i) => i.isDefault) ?? items[0] ?? null
        setStripeCard(def ? { brand: def.brand, last4: def.last4 } : null)
      })
      .catch(() => {
        if (!cancelled) setStripeCard(null)
      })
      .finally(() => {
        if (!cancelled) setStripeCardLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isStripe])

  const handleProviderChange = (value: PayProvider) => {
    setPayProvider(value)
    setAmount(null)
    setCustomAmount("")
  }

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
    if (!amount || amount < minAmount || amount > maxAmount) {
      toast.error(
        isStripe
          ? t('recharge.toastStripeMin', { min: String(RECHARGE_AMOUNTS.STRIPE_MIN) })
          : t('recharge.toastAmountError', {
              min: String(RECHARGE_AMOUNTS.MIN),
              max: String(RECHARGE_AMOUNTS.MAX),
            })
      )
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
      formData.append('locale', locale)

      const result = await createRechargeOrderAction(null, formData)

      if (result.ok && result.data) {
        onOrderCreated(result.data)
        if (result.data.payProvider === 'STRIPE') {
          if (result.data.payUrl) {
            toast.success(t("recharge.toastOrderSuccessStripe"))
          } else if (result.data.stripeChargeStatus === 'succeeded' && result.data.paid) {
            toast.success(t("recharge.toastRechargeSuccess"))
          } else if (result.data.requiresAction) {
            toast.info(t("recharge.toastStripe3ds"))
          } else {
            toast.success(t("recharge.toastOrderSuccessStripeCharge"))
          }
        } else {
          toast.success(t("recharge.toastOrderSuccess"))
        }
      } else if (!result.ok) {
        if (result.code === 'NEED_BIND_CARD') {
          toast.error(t("recharge.toastNeedBindCard"))
        } else {
          toast.error(result.error || t("recharge.toastOrderFail"))
        }
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
            {presets.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? "default" : "outline"}
                onClick={() => handlePresetAmount(preset)}
                className="h-12"
              >
                {moneySymbol}{preset}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-amount">{t("recharge.customAmount")}</Label>
            <Input
              id="custom-amount"
              type="number"
              placeholder={t(
                isStripe ? 'recharge.stripePlaceholder' : 'recharge.placeholder',
                { min: String(minAmount), max: String(maxAmount) }
              )}
              value={customAmount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              min={minAmount}
              max={maxAmount}
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              {isStripe
                ? t('recharge.stripeMinHint', {
                    min: String(RECHARGE_AMOUNTS.STRIPE_MIN),
                    max: String(RECHARGE_AMOUNTS.STRIPE_MAX),
                  })
                : t('recharge.minMax', {
                    min: String(RECHARGE_AMOUNTS.MIN),
                    max: String(RECHARGE_AMOUNTS.MAX),
                  })}
            </p>
            {isStripe && amount != null && amount > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('recharge.stripeCreditHint', {
                  cny: stripeUsdToCreditCny(amount).toFixed(2),
                })}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t("recharge.paymentMethod")}</Label>
          <RadioGroup value={payProvider} onValueChange={(v) => handleProviderChange(v as PayProvider)}>
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="STRIPE" id="stripe" />
              <Label htmlFor="stripe" className="cursor-pointer">
                {t("recharge.stripe")}
              </Label>
            </div>
          </RadioGroup>
          {isStripe && (
            <div className="space-y-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs">
              <p className="text-muted-foreground">{t('recharge.stripeUsdNotice')}</p>
              {stripeCardLoading ? (
                <p className="text-muted-foreground">{t('recharge.stripeCardChecking')}</p>
              ) : stripeCard?.last4 ? (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  {t('recharge.stripeSavedCard', {
                    brand: stripeCard.brand?.toUpperCase() ?? 'CARD',
                    last4: stripeCard.last4,
                  })}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {t('recharge.stripeNoCard')}{' '}
                  <LocaleLink href="/billing/payment-methods" className="text-primary underline-offset-2 hover:underline">
                    {t('recharge.stripeBindCardLink')}
                  </LocaleLink>
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!amount || loading}
          className="w-full"
          size="lg"
        >
          {loading
            ? t("recharge.creating")
            : `${t("recharge.confirm")} ${formatRechargeMoney(payProvider, amount ?? 0)}`}
        </Button>
      </CardContent>
    </Card>
  )
}
