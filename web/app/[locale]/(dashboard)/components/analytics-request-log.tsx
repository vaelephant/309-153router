"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

interface LogItem {
  id: string
  request_id: string | null
  route_reason: string | null
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

const statusColors: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  error: "bg-rose-100 text-rose-700 border-rose-200",
  rate_limited: "bg-amber-100 text-amber-700 border-amber-200",
}

function formatRouteReason(raw: string | null): string {
  if (!raw) return "—"
  try {
    const j = JSON.parse(raw) as { tier?: string; reason?: string[] }
    if (j.tier) return String(j.tier)
    if (j.reason?.[0]) return String(j.reason[0]).slice(0, 48)
  } catch {
    return raw.slice(0, 48)
  }
  return "—"
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
  const { t } = useI18n()
  const [showFilters, setShowFilters] = useState(false)

  const statusLabel = (status: string) => {
    if (status === "success") return t("analytics.statusSuccess")
    if (status === "error") return t("analytics.statusError")
    if (status === "rate_limited") return t("analytics.statusRateLimited")
    return status
  }

  if (loading && !data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("analytics.requestLogTitle")}</CardTitle>
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
            {t("analytics.requestLogTitle")}
            {data && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {t("analytics.logTotal", { count: data.total.toLocaleString() })}
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
            {t("analytics.filter")}
          </Button>
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("analytics.filterModel")}</span>
              <select
                className="h-7 text-xs rounded-md border border-input bg-background px-2"
                value={filters.model || ""}
                onChange={(e) => onFilterChange({ ...filters, model: e.target.value || undefined })}
              >
                <option value="">{t("analytics.filterAll")}</option>
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
                <option value="">{t("analytics.filterAll")}</option>
                <option value="success">{t("analytics.statusSuccess")}</option>
                <option value="error">{t("analytics.statusError")}</option>
                <option value="rate_limited">{t("analytics.statusRateLimited")}</option>
              </select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {!data || data.items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("analytics.noLogs")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colTime")}</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">{t("dashboard.requestId")}</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colModel")}</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colProvider")}</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.input")}</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.output")}</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colCost")}</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colLatency")}</th>
                    <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colStatus")}</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">{t("analytics.colRoute")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((log, i) => {
                    const scColor = statusColors[log.status] || statusColors.error
                    const isRouted = log.requested_model && log.requested_model !== log.model
                    return (
                      <tr key={log.id} className={i !== data.items.length - 1 ? "border-b border-border" : ""}>
                        <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="py-2 px-4 text-muted-foreground font-mono text-[10px] max-w-[120px] truncate" title={log.request_id || undefined}>
                          {log.request_id ? log.request_id.slice(0, 8) + "…" : "—"}
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
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${scColor}`}>
                            {statusLabel(log.status)}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap max-w-[140px]">
                          {isRouted ? (
                            <span className="text-[10px] text-emerald-600 block truncate" title={`${log.requested_model} → ${log.model}`}>
                              {log.requested_model} → {log.model}
                            </span>
                          ) : null}
                          {log.route_reason ? (
                            <span className="text-[10px] text-muted-foreground block truncate" title={log.route_reason}>
                              {formatRouteReason(log.route_reason)}
                            </span>
                          ) : !isRouted ? (
                            <span className="text-muted-foreground">—</span>
                          ) : null}
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
                  {t("analytics.pageInfo", { page: String(data.page), total: String(data.totalPages) })}
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
