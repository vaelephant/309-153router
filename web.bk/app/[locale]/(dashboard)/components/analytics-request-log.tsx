"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"

interface LogItem {
  id: string
  model: string
  requested_model: string | null
  provider: string | null
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost: number
  saved_cost: number
  latency_ms: number | null
  status: string
  created_at: string
}

interface LogsData {
  items: LogItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface AnalyticsRequestLogProps {
  data: LogsData | null
  loading: boolean
  onPageChange: (page: number) => void
  onFilterChange: (filters: { model?: string; status?: string }) => void
  filters: { model?: string; status?: string }
  availableModels: string[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  success: { label: "成功", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  error: { label: "失败", color: "bg-rose-100 text-rose-700 border-rose-200" },
  rate_limited: { label: "限流", color: "bg-amber-100 text-amber-700 border-amber-200" },
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function AnalyticsRequestLog({
  data,
  loading,
  onPageChange,
  onFilterChange,
  filters,
  availableModels,
}: AnalyticsRequestLogProps) {
  const [showFilters, setShowFilters] = useState(false)

  if (loading && !data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">请求明细日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            请求明细日志
            {data && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                共 {data.total.toLocaleString()} 条
              </span>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="size-3" />
            筛选
          </Button>
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">模型：</span>
              <select
                className="h-7 text-xs rounded-md border border-input bg-background px-2"
                value={filters.model || ""}
                onChange={(e) => onFilterChange({ ...filters, model: e.target.value || undefined })}
              >
                <option value="">全部</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">状态：</span>
              <select
                className="h-7 text-xs rounded-md border border-input bg-background px-2"
                value={filters.status || ""}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
              >
                <option value="">全部</option>
                <option value="success">成功</option>
                <option value="error">失败</option>
                <option value="rate_limited">限流</option>
              </select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {!data || data.items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            暂无请求记录
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">时间</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">模型</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">供应商</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">输入</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">输出</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">费用</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">延迟</th>
                    <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">状态</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">路由</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((log, i) => {
                    const sc = statusConfig[log.status] || statusConfig.error
                    const isRouted = log.requested_model && log.requested_model !== log.model
                    return (
                      <tr key={log.id} className={i !== data.items.length - 1 ? "border-b border-border" : ""}>
                        <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="py-2 px-4 font-medium text-card-foreground whitespace-nowrap">
                          {log.model}
                        </td>
                        <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                          {log.provider || "—"}
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums">
                          {log.input_tokens.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums">
                          {log.output_tokens.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums">
                          ¥{log.cost.toFixed(4)}
                        </td>
                        <td className="py-2 px-4 text-right tabular-nums">
                          {log.latency_ms != null ? `${log.latency_ms}ms` : "—"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sc.color}`}>
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          {isRouted ? (
                            <span className="text-[10px] text-emerald-600">
                              {log.requested_model} → {log.model}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  第 {data.page} / {data.totalPages} 页
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={data.page <= 1}
                    onClick={() => onPageChange(data.page - 1)}
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={data.page >= data.totalPages}
                    onClick={() => onPageChange(data.page + 1)}
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
