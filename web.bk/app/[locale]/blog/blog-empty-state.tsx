"use client"

import { useI18n } from "@/lib/i18n-context"

export function BlogEmptyState() {
  const { t } = useI18n()
  return (
    <div
      className="max-w-2xl mx-auto text-center py-20 rounded-xl border"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div className="text-5xl mb-4 opacity-50">📰</div>
      <p style={{ color: "var(--color-text-body)", fontSize: "1.125rem" }}>
        {t("news.emptyTitle")}
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("news.emptyDesc")}
      </p>
    </div>
  )
}
