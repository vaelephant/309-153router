"use client"

import { useI18n } from "@/lib/i18n-context"

export function BlogPageTitle() {
  const { t } = useI18n()
  return <>{t("news.sectionTitle")}</>
}
