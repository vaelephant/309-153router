'use client'

import { useCallback, useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthHeaders, getCurrentUserId } from '@/lib/auth-client'
import { useI18n } from '@/lib/i18n-context'
import { Loader2, CreditCard } from 'lucide-react'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

interface PaymentMethodItem {
  id: string
  paymentMethodId: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
}

function BindCardForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { t } = useI18n()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?setup=return`,
      },
      redirect: 'if_required',
    })

    setSubmitting(false)
    if (confirmError) {
      setError(confirmError.message ?? '绑卡失败')
      return
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={!stripe || submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('billing.bindCardSubmit')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          {t('billing.bindCardCancel')}
        </Button>
      </div>
    </form>
  )
}

export function BillingPaymentMethods() {
  const userId = getCurrentUserId()
  const { t } = useI18n()
  const [items, setItems] = useState<PaymentMethodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [binding, setBinding] = useState(false)

  const fetchMethods = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch('/api/billing/payment-methods', {
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (json.ok) {
        setItems(json.data.items ?? [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('setup') === 'return') {
      fetchMethods()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [fetchMethods])

  const startBind = async () => {
    if (!userId) return
    if (!stripePromise) {
      alert(t('billing.stripeNotConfigured'))
      return
    }
    setBinding(true)
    try {
      const res = await fetch('/api/billing/setup-intent', {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (!json.ok) {
        throw new Error(json.error || '创建绑卡会话失败')
      }
      setClientSecret(json.data.clientSecret)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : '创建绑卡会话失败')
      setBinding(false)
    }
  }

  const onBindSuccess = () => {
    setClientSecret(null)
    setBinding(false)
    fetchMethods()
  }

  if (!publishableKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.paymentMethodsTitle')}</CardTitle>
          <CardDescription>{t('billing.stripeNotConfigured')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{t('billing.paymentMethodsTitle')}</CardTitle>
            <CardDescription>{t('billing.paymentMethodsDesc')}</CardDescription>
          </div>
          {!clientSecret && (
            <Button size="sm" onClick={startBind} disabled={binding}>
              {binding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('billing.bindCard')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('billing.loading')}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('billing.noPaymentMethods')}</p>
          ) : (
            <ul className="space-y-2">
              {items.map((pm) => (
                <li
                  key={pm.id}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{pm.brand ?? 'card'}</span>
                  <span>···· {pm.last4}</span>
                  {pm.expMonth && pm.expYear && (
                    <span className="text-muted-foreground">
                      {pm.expMonth}/{pm.expYear}
                    </span>
                  )}
                  {pm.isDefault && (
                    <span className="text-xs text-primary">{t('billing.defaultCard')}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {clientSecret && stripePromise && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('billing.bindCardFormTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <BindCardForm
                onSuccess={onBindSuccess}
                onCancel={() => {
                  setClientSecret(null)
                  setBinding(false)
                }}
              />
            </Elements>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
