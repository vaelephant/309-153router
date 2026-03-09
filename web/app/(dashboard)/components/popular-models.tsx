"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight } from "lucide-react"

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
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/models")
        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setModels(result.data)
        } else {
          setError("数据格式错误")
        }
      } catch (err) {
        console.error("Failed to fetch models:", err)
        setError("获取模型列表失败")
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            可用模型
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-48 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (error || models.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground">
            可用模型
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            {error || "暂无可用模型"}
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          可用模型
        </CardTitle>
        <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
          全部模型
          <ArrowUpRight className="size-3" />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  模型
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  输入价格
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  输出价格
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  上下文
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  延迟
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  状态
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
                    <p className="text-[9px] text-muted-foreground">/ 1M tokens</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums text-card-foreground">
                      {model.outputPrice}
                    </span>
                    <p className="text-[9px] text-muted-foreground">/ 1M tokens</p>
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
                      {model.status === "online" ? "在线" : "降级"}
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
