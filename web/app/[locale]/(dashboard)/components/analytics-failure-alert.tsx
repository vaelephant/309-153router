"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

interface FailureOverview {
  error_count: number
  rate_limited_count: number
}

interface AnalyticsFailureAlertProps {
  data: FailureOverview | null
  onFilterStatus: (status: "error" | "rate_limited") => void
}

export function AnalyticsFailureAlert({ data, onFilterStatus }: AnalyticsFailureAlertProps) {
  const { t } = useI18n()

  if (!data) return null
  const total = data.error_count + data.rate_limited_count
  if (total <= 0) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3">
      <div className="flex items-start gap-2 text-sm">
        <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-foreground/90">
          {t("analytics.failureAlert", {
            total: String(total),
            errors: String(data.error_count),
            limited: String(data.rate_limited_count),
          })}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {data.error_count > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onFilterStatus("error")}
          >
            {t("analytics.viewErrors", { count: String(data.error_count) })}
          </Button>
        )}
        {data.rate_limited_count > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onFilterStatus("rate_limited")}
          >
            {t("analytics.viewRateLimited", { count: String(data.rate_limited_count) })}
          </Button>
        )}
      </div>
    </div>
  )
}
