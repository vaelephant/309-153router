"use client"

import { useI18n } from "@/lib/i18n-context"
import { AiGatewaySectionTitle } from "./ai-gateway-section-title"

export function AiGatewayAudience() {
  const { t } = useI18n()

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-lg">
        <AiGatewaySectionTitle title={t("aiGateway.audience.title")} />
        <div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border px-3 py-3 text-center text-[13px] font-medium"
              style={{
                borderColor: "var(--color-border-default)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-body)",
              }}
            >
              {t(`aiGateway.audience.item${i}`)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
