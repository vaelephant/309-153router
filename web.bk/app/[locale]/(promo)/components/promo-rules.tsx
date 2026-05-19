"use client"

import { CheckCircle2 } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const RULE_KEYS = [
  "promo.rule1",
  "promo.rule2",
  "promo.rule3",
  "promo.rule4",
  "promo.rule5",
] as const

export function PromoRules() {
  const { t } = useI18n()
  return (
    <section
      className="py-20"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="mb-8 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {t("promo.rulesTitle")}
        </h2>

        <div
          className="rounded-xl p-6 sm:p-8"
          style={{
            border: "1px solid var(--color-border-default)",
            backgroundColor: "var(--color-bg-page)",
          }}
        >
          <ul className="space-y-4">
            {RULE_KEYS.map((key, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed"
                style={{ color: "var(--color-text-body)" }}
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "var(--color-brand)" }}
                />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
