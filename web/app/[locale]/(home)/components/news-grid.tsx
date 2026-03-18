"use client"

import { useI18n } from "@/lib/i18n-context"
import { NewsCard } from "@/components/news-card"
import type { NewsItem } from "@/lib/news"

interface NewsGridProps {
  news: NewsItem[]
}

export function NewsGrid({ news }: NewsGridProps) {
  const { t, locale } = useI18n()

  if (news.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {news.map((item) => (
        <NewsCard
          key={item.slug}
          item={item}
          locale={locale}
          readTimeText={t("news.minRead", { min: item.readTimeMinutes ?? 1 })}
        />
      ))}
    </div>
  )
}
