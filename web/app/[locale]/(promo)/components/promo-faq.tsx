"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const FAQ_KEYS = [
  { q: "promo.faq1Q" as const, a: "promo.faq1A" as const },
  { q: "promo.faq2Q" as const, a: "promo.faq2A" as const },
  { q: "promo.faq3Q" as const, a: "promo.faq3A" as const },
  { q: "promo.faq4Q" as const, a: "promo.faq4A" as const },
  { q: "promo.faq5Q" as const, a: "promo.faq5A" as const },
  { q: "promo.faq6Q" as const, a: "promo.faq6A" as const },
]

export function PromoFaq() {
  const { t } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-6">
        <h2
          className="mb-4 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {t("promo.faqTitle")}
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          {t("promo.faqSubtitle")}
        </p>

        <div className="space-y-3">
          {FAQ_KEYS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  border: "1px solid var(--color-border-default)",
                  backgroundColor: isOpen
                    ? "var(--color-bg-surface)"
                    : "var(--color-bg-page)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="text-sm font-medium pr-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {t(item.q)}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform"
                    style={{
                      color: "var(--color-text-muted)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="px-5 pb-4 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {t(item.a)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
