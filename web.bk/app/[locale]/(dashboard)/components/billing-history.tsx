"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

interface RechargeOrder {
  id: string
  bizOrderNo: string
  amount: number
  payProvider: string
  status: string
  createdAt: string
  paidAt: string | null
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  createdAt: string
}

interface BillingData {
  balance: number
  rechargeOrders: RechargeOrder[]
  transactions: Transaction[]
}

const STATUS_KEYS: Record<string, { key: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  paid:     { key: 'billing.statusPaid', variant: 'default' },
  pending:  { key: 'billing.statusPending', variant: 'secondary' },
  failed:   { key: 'billing.statusFailed', variant: 'destructive' },
  canceled: { key: 'billing.statusCanceled', variant: 'outline' },
}

const PROVIDER_KEYS: Record<string, string> = {
  WECHAT: 'billing.providerWechat',
  ALIPAY: 'billing.providerAlipay',
}

const TYPE_KEYS: Record<string, string> = {
  recharge:   'billing.typeRecharge',
  usage:      'billing.typeUsage',
  refund:     'billing.typeRefund',
  adjustment: 'billing.typeAdjustment',
}

function formatDate(dateStr: string, locale: string) {
  const localeTag = locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US'
  return new Date(dateStr).toLocaleString(localeTag, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function BillingHistory() {
  const { t, locale } = useI18n()
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) { setLoading(false); return }

    fetch(`/${locale}/api/recharge/history`, {
      headers: { 'x-user-id': userId },
    })
      .then((r) => r.json())
      .then((json) => { if (json.ok) setData(json.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [locale])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("billing.currentBalance")}</p>
            <p className="text-3xl font-bold">
              ¥{(data?.balance ?? 0).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recharge">
        <TabsList>
          <TabsTrigger value="recharge">
            {t("billing.rechargeTab")}
            {data && data.rechargeOrders.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs">
                {data.rechargeOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            {t("billing.transactionsTab")}
            {data && data.transactions.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs">
                {data.transactions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recharge" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("billing.rechargeListTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!data || data.rechargeOrders.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {t("billing.noRecharge")}
                </div>
              ) : (
                <div className="divide-y">
                  {data.rechargeOrders.map((order) => {
                    const status = STATUS_KEYS[order.status] ?? { key: order.status, variant: 'outline' as const }
                    const label = status.key.startsWith('billing.') ? t(status.key) : status.key
                    return (
                      <div key={order.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ArrowDownCircle className="h-5 w-5 text-green-500 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              {PROVIDER_KEYS[order.payProvider] ? t(PROVIDER_KEYS[order.payProvider]) : order.payProvider}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {order.bizOrderNo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt, locale)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="text-base font-semibold text-green-600">
                            +¥{order.amount.toFixed(2)}
                          </p>
                          <Badge variant={status.variant} className="text-xs">
                            {label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("billing.transactionsListTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!data || data.transactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {t("billing.noTransactions")}
                </div>
              ) : (
                <div className="divide-y">
                  {data.transactions.map((tx) => {
                    const isIncome = tx.amount > 0
                    const typeLabel = TYPE_KEYS[tx.type] ? t(TYPE_KEYS[tx.type]) : tx.type
                    return (
                      <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isIncome ? (
                            <ArrowDownCircle className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <ArrowUpCircle className="h-5 w-5 text-orange-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {typeLabel}
                            </p>
                            {tx.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {tx.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.createdAt, locale)}
                            </p>
                          </div>
                        </div>
                        <p className={`text-base font-semibold ${isIncome ? 'text-green-600' : 'text-orange-600'}`}>
                          {isIncome ? '+' : ''}¥{tx.amount.toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
