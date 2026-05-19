"use client"

import { Check, X } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const COMPARISON_KEYS = [
  { featureKey: "promo.compareGpt4oInput" as const, direct: "¥0.0175", optrouter: "¥0.011", saving: true },
  { featureKey: "promo.compareGpt4oOutput" as const, direct: "¥0.07", optrouter: "¥0.044", saving: true },
  { featureKey: "promo.compareClaudeInput" as const, direct: "¥0.021", optrouter: "¥0.013", saving: true },
  { featureKey: "promo.compareFailover" as const, direct: null, optrouter: true, saving: false },
  { featureKey: "promo.compareSmartRoute" as const, direct: null, optrouter: true, saving: false },
  { featureKey: "promo.compareUnified" as const, direct: null, optrouter: true, saving: false },
]

export function PromoComparison() {
  const { t } = useI18n()
  return (
    <section
      className="py-20"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="mb-4 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {t("promo.whyCheaper")}
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          {t("promo.comparisonSubtitle")}
        </p>

        <div
          className="overflow-hidden rounded-xl"
          style={{
            border: "1px solid var(--color-border-default)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--color-bg-muted)",
                  borderBottom: "1px solid var(--color-border-default)",
                }}
              >
                <th
                  className="px-5 py-3 text-left text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {t("promo.compareItem")}
                </th>
                <th
                  className="px-5 py-3 text-center text-xs font-semibold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {t("promo.directCall")}
                </th>
                <th
                  className="px-5 py-3 text-center text-xs font-semibold"
                  style={{ color: "var(--color-brand)" }}
                >
                  {t("promo.optRouter")}
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_KEYS.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < COMPARISON_KEYS.length - 1
                        ? "1px solid var(--color-border-subtle)"
                        : "none",
                    backgroundColor: "var(--color-bg-surface)",
                  }}
                >
                  <td
                    className="px-5 py-3 text-sm"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {t(row.featureKey)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {row.direct === null ? (
                      <X
                        className="mx-auto h-4 w-4"
                        style={{ color: "var(--color-text-muted)" }}
                      />
                    ) : (
                      <span
                        className="text-sm tabular-nums"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {row.direct}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {row.optrouter === true ? (
                      <Check
                        className="mx-auto h-4 w-4"
                        style={{ color: "var(--color-brand)" }}
                      />
                    ) : (
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {row.optrouter as string}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
