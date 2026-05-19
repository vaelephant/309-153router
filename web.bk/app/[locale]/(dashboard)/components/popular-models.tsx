"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { LocaleLink } from "@/components/locale-link"

interface Model {
  name: string
  provider: string
  inputPrice: string
  outputPrice: string
  context: string
  latency: string
  status: "online" | "degraded"
}

export function PopularModels() {
  const { t, locale } = useI18n()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models")
        if (!response.ok) {
          console.error('Failed to fetch models: API returned', response.status)
          setModels([])
          setLoading(false)
          return
        }

        const apiData = await response.json()

        if (!apiData.models || !Array.isArray(apiData.models)) {
          console.error('Failed to fetch models: Invalid response format', apiData)
          setModels([])
          setLoading(false)
          return
        }

        // API 返回格式: { models: [{ name, provider, inputPrice, outputPrice, maxTokens, ... }] }
        const modelList = apiData.models.slice(0, 6).map((m: {
          name: string
          provider: string
          inputPrice: number
          outputPrice: number
          maxTokens: number | null
        }) => ({
          name: m.name,
          provider: formatProvider(m.provider),
          inputPrice: formatPrice(m.inputPrice),
          outputPrice: formatPrice(m.outputPrice),
          context: m.maxTokens ? formatTokens(m.maxTokens) : "—",
          latency: "—",
          status: "online" as const,
        }))

        setModels(modelList)
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setModels([])
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  /** 智能格式化价格：根据数值大小自适应小数位数 */
  function formatPrice(price: number): string {
    if (price === 0) return '¥0'
    if (price >= 1) return `¥${price.toFixed(2)}`
    if (price >= 0.01) return `¥${price.toFixed(4)}`
    return `¥${price.toFixed(6)}`
  }

  function formatProvider(provider: string): string {
    const p = provider.toLowerCase()
    if (p.includes('openai')) return 'OpenAI'
    if (p.includes('anthropic')) return 'Anthropic'
    if (p.includes('google')) return 'Google'
    if (p.includes('deepseek')) return 'DeepSeek'
    if (p.includes('meta') || p.includes('llama')) return 'Meta'
    if (p.includes('mistral')) return 'Mistral'
    if (p.includes('qwen') || p.includes('alibaba')) return 'Alibaba'
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  function formatTokens(tokens: number): string {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
    return `${tokens}`
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            {t("models.availableModels")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (models.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            {t("models.availableModels")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("models.noModels")}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {t("models.availableModels")}
        </CardTitle>
        <LocaleLink href="/models" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
          {t("models.allModels")}
          <ArrowUpRight className="size-3" />
        </LocaleLink>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("models.model")}
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("models.inputPrice")}
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("models.outputPrice")}
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("models.context")}
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("models.latency")}
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("models.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr
                  key={model.name}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div>
                      <span className="text-xs font-medium text-card-foreground">
                        {model.name}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {model.provider}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums text-card-foreground">
                      {model.inputPrice}
                    </span>
                    <p className="text-[9px] text-muted-foreground">{t("models.per1kTokens")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums text-card-foreground">
                      {model.outputPrice}
                    </span>
                    <p className="text-[9px] text-muted-foreground">{t("models.per1kTokens")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums text-card-foreground">
                      {model.context}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums text-card-foreground">
                      {model.latency}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1.5 py-0 border-0 ${
                        model.status === "online"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {model.status === "online" ? t("models.online") : t("models.degraded")}
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
