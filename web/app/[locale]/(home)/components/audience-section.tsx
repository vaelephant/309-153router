"use client"

import { Sparkles, Boxes, Building2, ServerCog } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const ICONS = [Sparkles, Boxes, Building2, ServerCog]

export function AudienceSection() {
  const { t } = useI18n()
  const cards = [0, 1, 2, 3].map((i) => ({
    icon: ICONS[i],
    title: t(`audience.card${i}Title`),
    desc: t(`audience.card${i}Desc`),
  }))

  return (
    <section
      id="audience"
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
          }}
        >
          {t("audience.title")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.title} className="ds-card flex gap-4 rounded-xl" style={{ padding: "var(--space-6)" }}>
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-primary)" }}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {c.title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--color-text-body)" }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
