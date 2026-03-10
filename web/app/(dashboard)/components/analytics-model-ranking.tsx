"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface ModelData {
  name: string
  requests: number
  tokens: number
  input_tokens: number
  output_tokens: number
  cost: number
  saved_cost: number
  avg_latency: number
  percentage: number
}

interface AnalyticsModelRankingProps {
  data: ModelData[] | null
  loading: boolean
}

const COLORS = [
  "#003153", "#0055a0", "#0078d4", "#339dff", "#66b5ff",
  "#99ccff", "#5b8c5a", "#8fbc8f", "#b0c4de", "#778899",
]

function BarTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: ModelData }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-popover-foreground mb-1">{d.name}</p>
      <p className="text-muted-foreground">请求数：{d.requests.toLocaleString()}</p>
      <p className="text-muted-foreground">Token：{formatTokens(d.tokens)}</p>
      <p className="text-muted-foreground">费用：¥{d.cost.toFixed(4)}</p>
      <p className="text-muted-foreground">延迟：{d.avg_latency}ms</p>
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

export function AnalyticsModelRanking({ data, loading }: AnalyticsModelRankingProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">模型使用排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">模型使用排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            暂无数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const top10 = data.slice(0, 10)

  return (
    <div className="space-y-4">
      {/* 柱状图 */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">模型请求量分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9a9a9a" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9a9a9a" }}
                  width={120}
                />
                <RechartsTooltip content={<BarTooltip />} />
                <Bar dataKey="requests" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {top10.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 明细表格 */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">模型使用明细</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">模型</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">请求数</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">占比</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">输入 Token</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">输出 Token</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">费用</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">节省</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">平均延迟</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m, i) => (
                  <tr key={m.name} className={i !== data.length - 1 ? "border-b border-border" : ""}>
                    <td className="py-2.5 px-4 font-medium text-card-foreground">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {m.name}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{m.requests.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {m.percentage.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{formatTokens(m.input_tokens)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{formatTokens(m.output_tokens)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums">¥{m.cost.toFixed(4)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-emerald-600">
                      {m.saved_cost > 0 ? `¥${m.saved_cost.toFixed(4)}` : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{m.avg_latency}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
