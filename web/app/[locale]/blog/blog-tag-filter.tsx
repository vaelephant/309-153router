"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

interface BlogTagFilterProps {
  locale: string
  currentTag: string | undefined
}

export function BlogTagFilter({ locale, currentTag }: BlogTagFilterProps) {
  const { t } = useI18n()
  if (!currentTag) return null
  return (
    <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
      {t("news.filterTag", { tag: currentTag })}
      {" · "}
      <Link
        href={`/${locale}/blog`}
        className="underline hover:opacity-80"
        style={{ color: "var(--color-brand)" }}
      >
        {t("news.clearFilter")}
      </Link>
    </p>
  )
}
