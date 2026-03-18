"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { NewsCard } from "@/components/news-card"
import type { NewsItem } from "@/lib/news"

interface NewsSectionProps {
  news: NewsItem[]
}

export function NewsSection({ news }: NewsSectionProps) {
  const { t, locale } = useI18n()
  const displayList = news.slice(0, 6)

  if (displayList.length === 0) return null

  return (
    <section
      id="news"
      className="border-t py-24"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--layout-section-spacing)",
        paddingBottom: "var(--layout-section-spacing)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-4)",
            }}
          >
            {t("news.sectionTitle")}
          </h2>
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              color: "var(--color-text-body)",
            }}
          >
            {t("news.sectionSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((item) => (
            <NewsCard
              key={item.slug}
              item={item}
              locale={locale}
              readTimeText={t("news.minRead", { min: item.readTimeMinutes ?? 1 })}
            />
          ))}
        </div>

        {news.length > displayList.length && (
          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "var(--color-brand)" }}
            >
              {t("news.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
