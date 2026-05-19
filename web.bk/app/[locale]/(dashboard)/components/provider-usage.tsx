"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { useState, useEffect } from "react"
import { getCurrentUserId } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

interface ProviderData {
  name: string
  requests: number
  tokens: number
  cost: number
  percentage: number
  color: string
}

const providerColors: Record<string, string> = {
  OpenAI: "#003153",
  Anthropic: "#1a5276",
  Google: "#2e86c1",
  DeepSeek: "#5dade2",
  Meta: "#85c1e9",
  Ollama: "#aed6f1",
  Other: "#d4e6f1",
}

function getProvider(modelName: string): string {
  const name = modelName.toLowerCase()
  if (name.includes("gpt") || name.includes("openai")) return "OpenAI"
  if (name.includes("claude") || name.includes("anthropic")) return "Anthropic"
  if (name.includes("gemini") || name.includes("google")) return "Google"
  if (name.includes("deepseek")) return "DeepSeek"
  if (name.includes("llama") || name.includes("meta")) return "Meta"
  if (name.includes("ollama")) return "Ollama"
  return "Other"
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-popover-foreground">{payload[0].name}</p>
      <p className="text-xs text-muted-foreground">{payload[0].value}%</p>
    </div>
  )
}

export function ProviderUsage() {
  const { t, locale } = useI18n()
  const [providers, setProviders] = useState<ProviderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const userId = getCurrentUserId()
      if (!userId) {
        setProviders([])
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/${locale}/api/usage?days=30`, {
          headers: { "x-user-id": userId },
        })
        const result = await response.json()

        if (result.model_breakdown) {
          const entries = Object.entries(result.model_breakdown) as [
            string,
            { tokens: number; cost: number; requests: number },
          ][]
          const byProvider: Record<
            string,
            { tokens: number; cost: number; requests: number }
          > = {}
          for (const [modelName, data] of entries) {
            const provider = getProvider(modelName)
            if (!byProvider[provider]) {
              byProvider[provider] = { tokens: 0, cost: 0, requests: 0 }
            }
            byProvider[provider].tokens += data.tokens
            byProvider[provider].cost += data.cost
            byProvider[provider].requests += data.requests
          }

          const totalTokens = Object.values(byProvider).reduce(
            (sum, p) => sum + p.tokens,
            0
          )
          const providerNames = Object.keys(providerColors)
          const list = Object.entries(byProvider)
            .map(([name, data], index) => ({
              name,
              requests: data.requests,
              tokens: data.tokens,
              cost: data.cost,
              percentage:
                totalTokens > 0
                  ? Math.round((data.tokens / totalTokens) * 100)
                  : 0,
              color:
                providerColors[name] ||
                Object.values(providerColors)[index % providerNames.length],
            }))
            .sort((a, b) => b.percentage - a.percentage)

          setProviders(list)
        }
      } catch (error) {
        console.error("Failed to fetch provider usage:", error)
        setProviders([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [locale])

  const pieData = providers.map((p) => ({ name: p.name, value: p.percentage }))
  const COLORS = providers.map((p) => p.color)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {t("dashboard.providerUsage")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : providers.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.noData")}
          </div>
        ) : (
          <>
            <div className="mx-auto h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center gap-3"
                >
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: provider.color }}
                  />
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="text-xs font-medium text-card-foreground truncate">
                      {provider.name}
                    </span>
                    <span className="text-[11px] font-medium text-card-foreground tabular-nums shrink-0 ml-2">
                      {provider.percentage}% ·{" "}
                      {provider.cost < 0.01 && provider.cost > 0
                        ? `¥${provider.cost.toFixed(4)}`
                        : `¥${provider.cost.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
