"use client"

import { UserPlus, Share2, Wallet } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const STEPS = [
  { step: "01", icon: UserPlus, titleKey: "promo.step1Title" as const, descKey: "promo.step1Desc" as const },
  { step: "02", icon: Share2, titleKey: "promo.step2Title" as const, descKey: "promo.step2Desc" as const },
  { step: "03", icon: Wallet, titleKey: "promo.step3Title" as const, descKey: "promo.step3Desc" as const },
]

export function PromoSteps() {
  const { t } = useI18n()
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="mb-4 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {t("promo.stepsTitle")}
        </h2>
        <p
          className="mb-12 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          {t("promo.stepsSubtitle")}
        </p>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "var(--color-brand)",
                  color: "#fff",
                }}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <span
                className="mb-2 block text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--color-text-muted)" }}
              >
                Step {item.step}
              </span>
              <h3
                className="mb-2 text-lg font-semibold"
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
