"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"

interface ApiKeyData {
  id: string | null
  label: string
  requests: number
  tokens: number
  cost: number
  avg_latency: number
  percentage: number
}

interface AnalyticsApiKeyRankingProps {
  data: ApiKeyData[] | null
  loading: boolean
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export function AnalyticsApiKeyRanking({ data, loading }: AnalyticsApiKeyRankingProps) {
  const { t } = useI18n()

  if (loading && !data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("dashboard.apiKeyUsageTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("dashboard.apiKeyUsageTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">{t("dashboard.noData")}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t("dashboard.apiKeyUsageTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">API Key</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("dashboard.requestLabel")}</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Token</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("dashboard.costLabel")}</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("dashboard.latency")}</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">占比</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.id ?? `unknown-${i}`}
                  className={i !== data.length - 1 ? "border-b border-border" : ""}
                >
                  <td className="py-2.5 px-4 font-medium max-w-[200px] truncate" title={row.label}>
                    {row.label}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{row.requests.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{formatTokens(row.tokens)}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">¥{row.cost.toFixed(4)}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums">{row.avg_latency}ms</td>
                  <td className="py-2.5 px-4 text-right">
                    <Badge variant="secondary" className="text-[10px]">
                      {row.percentage.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
