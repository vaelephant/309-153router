"use client"

import { GitBranch, Plug, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useTrafficSource } from "@/lib/use-traffic-source"

const PILL_ICONS = [Plug, GitBranch, Sparkles] as const

export function AiGatewayHero() {
  const { t } = useI18n()
  useTrafficSource()

  const pills = [0, 1, 2].map((i) => ({
    Icon: PILL_ICONS[i] ?? Plug,
    label: t(`aiGateway.hero.pill${i}`),
  }))

  return (
    <section
      className="relative overflow-hidden px-4 pb-8 pt-6"
      aria-label={t("aiGateway.hero.ariaLabel")}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-8 h-48 w-48 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--color-accent-primary)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-lg">
        <p
          className="mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
          style={{
            color: "var(--color-accent-primary)",
            backgroundColor: "color-mix(in srgb, var(--color-accent-soft) 85%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-accent-primary) 25%, transparent)",
          }}
        >
          {t("aiGateway.hero.badge")}
        </p>

        <h1
          className="text-balance text-[28px] font-semibold leading-[1.2] tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("aiGateway.hero.title")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--color-text-body)" }}>
          {t("aiGateway.hero.subtitle")}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border-default)",
              }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-accent-primary)" }} aria-hidden />
              {label}
            </span>
          ))}
        </div>

        <ul
          className="mt-5 space-y-2.5 rounded-2xl border p-4"
          style={{
            borderColor: "var(--color-border-default)",
            backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 90%, transparent)",
          }}
        >
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex gap-2.5 text-[14px]" style={{ color: "var(--color-text-body)" }}>
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-accent-primary) 18%, transparent)",
                  color: "var(--color-accent-primary)",
                }}
                aria-hidden
              >
                ✓
              </span>
              <span>{t(`aiGateway.hero.point${i}`)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {t("aiGateway.hero.trust")}
        </p>
      </div>
    </section>
  )
}
