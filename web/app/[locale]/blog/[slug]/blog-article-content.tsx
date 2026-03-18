"use client"

import { useI18n } from "@/lib/i18n-context"

function formatDate(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

type BlogArticleContentProps =
  | { type: "backLabel" }
  | { type: "meta"; date: string; locale: string; readTimeMinutes?: number }

export function BlogArticleContent(props: BlogArticleContentProps) {
  const { t } = useI18n()
  if (props.type === "backLabel") {
    return <>{t("news.backToList")}</>
  }
  const { date, locale, readTimeMinutes = 1 } = props
  return (
    <div
      className="flex items-center gap-3 mb-4 text-sm"
      style={{ color: "var(--color-text-muted)" }}
    >
      <span>{formatDate(date, locale)}</span>
      <span>{t("news.minRead", { min: readTimeMinutes })}</span>
    </div>
  )
}
