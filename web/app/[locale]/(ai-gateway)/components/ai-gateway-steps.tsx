"use client"

import { useI18n } from "@/lib/i18n-context"
import { AiGatewaySectionTitle } from "./ai-gateway-section-title"

export function AiGatewaySteps() {
  const { t } = useI18n()

  return (
    <section className="border-t px-4 py-8" style={{ borderColor: "var(--color-border-default)" }}>
      <div className="mx-auto max-w-lg">
        <AiGatewaySectionTitle title={t("aiGateway.steps.title")} />
        <ol className="space-y-4">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex gap-4">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: "var(--color-button-primary-bg)",
                  color: "var(--color-button-primary-text)",
                }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {t(`aiGateway.steps.item${i}Title`)}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {t(`aiGateway.steps.item${i}Desc`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
