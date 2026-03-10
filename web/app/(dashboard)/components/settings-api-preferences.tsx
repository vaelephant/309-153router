"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gauge, Zap } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"

interface ApiKeyInfo {
  name: string
  rate_limit: number
  status: string
  created_at: string
}

interface PlanData {
  planName: string
  balance: number
}

export function SettingsApiPreferences() {
  const [planData, setPlanData] = useState<PlanData | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const userId = getCurrentUserId()
      if (!userId) { setLoading(false); return }

      try {
        const [planRes, keysRes] = await Promise.all([
          fetch("/api/plan", { headers: { "x-user-id": userId } }),
          fetch("/api/keys", { headers: { "x-user-id": userId } }),
        ])

        const planJson = await planRes.json()
        if (planJson.data) {
          setPlanData(planJson.data)
        }

        const keysJson = await keysRes.json()
        if (keysJson.data && Array.isArray(keysJson.data)) {
          setApiKeys(
            keysJson.data
              .filter((k: Record<string, unknown>) => k.status === "active")
              .map((k: Record<string, unknown>) => ({
                name: (k.masked_key as string) || "未命名",
                rate_limit: k.quota_limit ? Math.round((k.quota_limit as number) / (60 * 24 * 30)) : 60,
                status: k.status as string,
                created_at: k.created_at as string,
              }))
          )
        }
      } catch (error) {
        console.error("Failed to fetch API preferences:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">API 偏好</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 当前方案信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="size-4" />
            当前方案
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">方案名称</span>
              <Badge variant="outline" className="text-xs">
                {planData?.planName || "免费"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">当前余额</span>
              <span className="text-sm font-medium">¥{(planData?.balance ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key 速率限制 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="size-4" />
            API Key 速率限制
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {apiKeys.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              暂无活跃的 API Key
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">名称</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">速率限制</th>
                    <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key, i) => (
                    <tr key={i} className={i !== apiKeys.length - 1 ? "border-b border-border" : ""}>
                      <td className="py-2.5 px-4 font-medium">{key.name}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        {key.rate_limit} 次/分钟
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          活跃
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
