"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"

interface CatalogModel {
  name: string
  provider: string
  inputPrice: number
  outputPrice: number
  maxTokens: number | null
  description: string | null
  tier: string | null
}

function formatProvider(code: string): string {
  const map: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    deepseek: "DeepSeek",
    together: "Together",
    ollama: "Ollama",
  }
  return map[code.toLowerCase()] || code
}

function formatPrice(price: number): string {
  if (price === 0) return "—"
  if (price < 0.01) return `¥${price.toFixed(6)}`
  return `¥${price.toFixed(4)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

export function ModelsCatalog() {
  const { t } = useI18n()
  const [models, setModels] = useState<CatalogModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/models")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setModels(Array.isArray(data.models) ? data.models : [])
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "unknown")
          setModels([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.modelsCatalog")}
          {!loading && models.length > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {models.length}
            </span>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">{t("dashboard.modelsVirtualHint")}</p>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-destructive">{error}</div>
        ) : models.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("dashboard.modelsEmpty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
                    {t("dashboard.modelsColModel")}
                  </th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
                    {t("dashboard.modelsColProvider")}
                  </th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">
                    {t("dashboard.modelsColInput")}
                  </th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">
                    {t("dashboard.modelsColOutput")}
                  </th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">
                    {t("dashboard.modelsColContext")}
                  </th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">
                    {t("dashboard.modelsColDesc")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr
                    key={m.name}
                    className={i !== models.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="py-2.5 px-4 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {m.name}
                        {m.tier && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {m.tier}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatProvider(m.provider)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums whitespace-nowrap">
                      {formatPrice(m.inputPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums whitespace-nowrap">
                      {formatPrice(m.outputPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums whitespace-nowrap">
                      {m.maxTokens ? formatTokens(m.maxTokens) : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate">
                      {m.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
