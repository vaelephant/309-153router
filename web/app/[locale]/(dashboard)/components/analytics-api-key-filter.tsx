"use client"

import { Key } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export interface ApiKeyOption {
  id: string
  label: string
}

interface AnalyticsApiKeyFilterProps {
  value: string
  options: ApiKeyOption[]
  onChange: (apiKeyId: string) => void
}

export function AnalyticsApiKeyFilter({ value, options, onChange }: AnalyticsApiKeyFilterProps) {
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <Key className="size-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">{t("dashboard.filterByApiKey")}:</span>
      <select
        className="h-7 min-w-[140px] max-w-[220px] text-xs rounded-md border border-input bg-background px-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("dashboard.allApiKeys")}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
