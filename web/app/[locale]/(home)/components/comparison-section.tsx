"use client"

import { useI18n } from "@/lib/i18n-context"

export function ComparisonSection() {
  const { t } = useI18n()
  const cols = [
    { titleKey: "comparison.col0Title", descKey: "comparison.col0Desc", highlight: false },
    { titleKey: "comparison.col1Title", descKey: "comparison.col1Desc", highlight: false },
    { titleKey: "comparison.col2Title", descKey: "comparison.col2Desc", highlight: true },
  ]

  return (
    <section
      id="comparison"
      className="border-t py-24"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--layout-section-spacing)",
        paddingBottom: "var(--layout-section-spacing)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="mx-auto max-w-3xl text-center"
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-8)",
            lineHeight: 1.35,
          }}
        >
          {t("comparison.title")}
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {cols.map((col) => (
            <div
              key={col.titleKey}
              className="rounded-xl border p-6"
              style={{
                borderColor: col.highlight ? "var(--color-accent-primary)" : "var(--color-border-default)",
                backgroundColor: col.highlight ? "var(--color-bg-muted)" : "var(--color-bg-surface)",
                borderWidth: col.highlight ? 2 : 1,
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                {t(col.titleKey)}
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--color-text-body)" }}>
                {t(col.descKey)}
              </p>
            </div>
          ))}
        </div>
        <p
          className="mx-auto mt-10 max-w-3xl text-center text-sm"
          style={{ color: "var(--color-text-body)", lineHeight: 1.65 }}
        >
          {t("comparison.footer")}
        </p>
      </div>
    </section>
  )
}
