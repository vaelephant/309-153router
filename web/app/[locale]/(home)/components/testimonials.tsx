"use client"

import { Star } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

function maskName(name: string): string {
  if (name.length <= 1) return name
  if (name.length === 2) {
    return `${name[0]}*${name[1]}`
  }
  return `${name[0]}*${name[name.length - 1]}`
}

interface TestimonialCardData {
  name: string
  role: string
  company: string
  content: string
  rating: number
}

function TestimonialCard({ card }: { card: TestimonialCardData }) {
  const maskedName = maskName(card.name)

  return (
    <div
      className="flex h-full flex-col rounded-xl border p-6"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div className="mb-4 flex gap-0.5">
        {Array.from({ length: card.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="mb-6 flex-1 text-sm leading-relaxed" style={{ color: "var(--color-text-body)" }}>
        &ldquo;{card.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: "var(--color-accent-soft)",
            color: "var(--color-brand)",
          }}
        >
          {card.name[0]}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            {maskedName}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {card.role} · {card.company}
          </p>
        </div>
      </div>
    </div>
  )
}

const CARD_COUNT = 6

export function Testimonials() {
  const { t } = useI18n()
  const cards: TestimonialCardData[] = Array.from({ length: CARD_COUNT }, (_, i) => ({
    name: t(`testimonials.card${i}Name`),
    role: t(`testimonials.card${i}Role`),
    company: t(`testimonials.card${i}Company`),
    content: t(`testimonials.card${i}Content`),
    rating: 5,
  }))

  return (
    <section
      id="testimonials"
      className="border-t py-24"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--layout-section-spacing)",
        paddingBottom: "var(--layout-section-spacing)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-4)",
            }}
          >
            {t("testimonials.title")}
          </h2>
          <p style={{ fontSize: "18px", color: "var(--color-text-body)" }}>{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <TestimonialCard key={i} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
