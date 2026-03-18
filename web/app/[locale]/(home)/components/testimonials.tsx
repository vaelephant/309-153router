"use client"

import { Star } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

// 将名字中间加*号，如"张明" -> "张*明"
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
      className="flex-shrink-0 w-[340px] rounded-xl border p-6"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: card.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-amber-400 text-amber-400"
          />
        ))}
      </div>
      <p
        className="mb-6 text-sm leading-relaxed line-clamp-4"
        style={{ color: 'var(--color-text-body)' }}
      >
        &ldquo;{card.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-accent-soft)',
            color: 'var(--color-brand)',
          }}
        >
          {card.name[0]}
        </div>
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {maskedName}
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {card.role} · {card.company}
          </p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const { t } = useI18n()
  const cards: TestimonialCardData[] = Array.from({ length: 10 }, (_, i) => ({
    name: t(`testimonials.card${i}Name`),
    role: t(`testimonials.card${i}Role`),
    company: t(`testimonials.card${i}Company`),
    content: t(`testimonials.card${i}Content`),
    rating: 5,
  }))
  const items = [...cards, ...cards]

  return (
    <section
      id="testimonials"
      className="border-t py-24 overflow-hidden"
      style={{
        borderColor: 'var(--color-border-default)',
        paddingTop: 'var(--layout-section-spacing)',
        paddingBottom: 'var(--layout-section-spacing)',
      }}
    >
      <div className="mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t("testimonials.title")}
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-body)',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            {t("testimonials.subtitle")}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-6 animate-marquee">
          {items.map((card, i) => (
            <TestimonialCard key={`a-${i}`} card={card} />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24"
          style={{
            background: 'linear-gradient(to right, var(--color-bg-page), transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24"
          style={{
            background: 'linear-gradient(to left, var(--color-bg-page), transparent)',
          }}
        />
      </div>
    </section>
  )
}
