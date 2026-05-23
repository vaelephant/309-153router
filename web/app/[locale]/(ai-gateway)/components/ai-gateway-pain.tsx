"use client"

import { Layers, CircleDollarSign, Activity, BarChart3 } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { AiGatewaySectionTitle } from "./ai-gateway-section-title"

const ICONS = [Layers, CircleDollarSign, Activity, BarChart3]

export function AiGatewayPain() {
  const { t } = useI18n()

  return (
    <section className="border-t px-4 py-8" style={{ borderColor: "var(--color-border-default)" }}>
      <div className="mx-auto max-w-lg">
        <AiGatewaySectionTitle title={t("aiGateway.why.title")} />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={i}
                className="rounded-xl border p-3.5"
                style={{
                  borderColor: "var(--color-border-default)",
                  backgroundColor: "var(--color-bg-surface)",
                }}
              >
                <div
                  className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "var(--color-bg-muted)",
                    color: "var(--color-accent-primary)",
                  }}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                  {t(`aiGateway.why.item${i}Title`)}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {t(`aiGateway.why.item${i}Desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
