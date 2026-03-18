"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"
import type { NewsItem } from "@/lib/news"

function formatNewsDate(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

function getExcerpt(item: NewsItem, maxLen = 120): string {
  if (item.excerpt) return item.excerpt
  const plain = item.content
    .replace(/[#*`\[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain
}

export interface NewsCardProps {
  item: NewsItem
  locale: string
  readTimeText: string
}

export function NewsCard({ item, locale, readTimeText }: NewsCardProps) {
  const excerpt = getExcerpt(item)

  return (
    <Link
      href={`/${locale}/blog/${item.slug}`}
      className="group block rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div className="relative h-44 w-full overflow-hidden bg-[var(--color-bg-muted)]">
        <Image
          src={item.coverImage.startsWith("/") ? item.coverImage : `/${item.coverImage}`}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={item.coverImage === "/icon.svg"}
        />
      </div>
      <div className="p-5">
        <h3
          className="text-lg font-bold mb-2 line-clamp-2 transition-colors group-hover:opacity-90"
          style={{ color: "var(--color-brand)" }}
        >
          {item.title}
        </h3>
        {excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-3 mb-3"
            style={{ color: "var(--color-text-body)" }}
          >
            {excerpt}
          </p>
        )}
        <div
          className="flex items-center gap-2 text-xs mb-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>{formatNewsDate(item.date, locale)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readTimeText}
          </span>
        </div>
        {(item.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags!.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium"
                style={{
                  border: "1px solid var(--color-border-default)",
                  backgroundColor: "var(--color-bg-page)",
                  color: "var(--color-brand)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
