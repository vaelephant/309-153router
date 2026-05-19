"use client"

import { TrendingDown, Zap, Shield, Gift } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const FEATURE_KEYS = [
  { icon: TrendingDown, titleKey: "promo.feature1Title" as const, descKey: "promo.feature1Desc" as const },
  { icon: Zap, titleKey: "promo.feature2Title" as const, descKey: "promo.feature2Desc" as const },
  { icon: Shield, titleKey: "promo.feature3Title" as const, descKey: "promo.feature3Desc" as const },
  { icon: Gift, titleKey: "promo.feature4Title" as const, descKey: "promo.feature4Desc" as const },
]

export function PromoFeatures() {
  const { t } = useI18n()
  return (
    <section
      className="py-20"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="mb-12 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {t("promo.featuresTitle")}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((item) => (
            <div
              key={item.titleKey}
              className="rounded-xl p-6"
              style={{
                border: "1px solid var(--color-border-default)",
                backgroundColor: "var(--color-bg-page)",
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--color-accent-soft)" }}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: "var(--color-brand)" }}
                />
              </div>
              <h3
                className="mb-2 text-base font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {t(item.titleKey)}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-body)" }}
              >
                {t(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
