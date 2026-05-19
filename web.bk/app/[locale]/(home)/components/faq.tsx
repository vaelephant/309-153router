"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const FAQ_KEYS = ["q0", "q1", "q2", "q3", "q4", "q5"] as const

export function FAQ() {
  const { t } = useI18n()
  const faqs = FAQ_KEYS.map((_, i) => ({
    question: t(`faq.${FAQ_KEYS[i]}`),
    answer: t(`faq.a${i}`),
  }))
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      id="faq"
      className="border-t py-24"
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
            {t("faq.title")}
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-body)',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border overflow-hidden"
              style={{
                borderColor: 'var(--color-border-default)',
                backgroundColor: 'var(--color-bg-surface)',
              }}
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
                style={{
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                }}
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
              >
                <span className="text-sm font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </button>
              {openIndex === index && (
                <div
                  className="px-6 pb-4"
                  style={{ color: 'var(--color-text-body)' }}
                >
                  <p className="text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
