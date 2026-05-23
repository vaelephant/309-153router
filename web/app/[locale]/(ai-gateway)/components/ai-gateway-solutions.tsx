"use client"

import { Plug, GitBranch, Gauge } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { AiGatewaySectionTitle } from "./ai-gateway-section-title"

const ICONS = [Plug, GitBranch, Gauge]

export function AiGatewaySolutions() {
  const { t } = useI18n()

  return (
    <section
      className="px-4 py-8"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-bg-muted) 50%, transparent) 0%, transparent 100%)",
      }}
    >
      <div className="mx-auto max-w-lg">
        <AiGatewaySectionTitle title={t("aiGateway.solutions.title")} />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={i}
                className="flex gap-3.5 rounded-xl border p-4"
                style={{
                  borderColor: "var(--color-border-default)",
                  backgroundColor: "var(--color-bg-surface)",
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-accent-primary) 12%, var(--color-bg-muted))",
                    color: "var(--color-accent-primary)",
                  }}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {t(`aiGateway.solutions.item${i}Title`)}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {t(`aiGateway.solutions.item${i}Desc`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
