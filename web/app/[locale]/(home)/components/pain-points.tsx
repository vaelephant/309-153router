"use client"

import { Layers, Activity, CircleDollarSign, UsersRound, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const ICONS = [Layers, Activity, CircleDollarSign, UsersRound]
const ACCENT = [
  "color-mix(in srgb, var(--color-accent-primary) 55%, transparent)",
  "color-mix(in srgb, var(--color-brand) 45%, transparent)",
  "color-mix(in srgb, var(--color-accent-primary) 40%, transparent)",
  "color-mix(in srgb, var(--color-brand) 35%, transparent)",
]

export function PainPoints() {
  const { t } = useI18n()
  const cards = [0, 1, 2, 3].map((i) => ({
    icon: ICONS[i],
    accent: ACCENT[i],
    num: String(i + 1).padStart(2, "0"),
    title: t(`painPoints.card${i}Title`),
    desc: t(`painPoints.card${i}Desc`),
  }))

  return (
    <section
      id="pain-points"
      className="relative border-t py-24"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--layout-section-spacing)",
        paddingBottom: "var(--layout-section-spacing)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-bg-muted) 55%, transparent) 0%, transparent 42%, color-mix(in srgb, var(--color-bg-muted) 35%, transparent) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,720px)] -translate-x-1/2 opacity-60"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-accent-primary), transparent)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <h2
          className="mx-auto max-w-3xl text-balance text-center"
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-8)",
            lineHeight: 1.35,
          }}
        >
          {t("painPoints.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {cards.map((c, idx) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                borderColor: "var(--color-border-default)",
                backgroundColor: "var(--color-bg-surface)",
                boxShadow: "0 2px 0 color-mix(in srgb, var(--color-text-primary) 4%, transparent)",
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-2xl opacity-90 transition-opacity group-hover:opacity-100"
                style={{ background: c.accent }}
                aria-hidden
              />
              <div className="relative flex gap-4 pl-1">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: "var(--color-bg-muted)",
                    color: "var(--color-text-primary)",
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c.accent} 25%, transparent)`,
                  }}
                >
                  <c.icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3
                      className="text-[17px] font-semibold leading-snug"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {c.title}
                    </h3>
                    <span
                      className="shrink-0 font-mono text-[11px] font-bold tabular-nums tracking-widest opacity-40 transition-opacity group-hover:opacity-70"
                      style={{ color: "var(--color-text-muted)" }}
                      aria-hidden
                    >
                      {c.num}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-body)" }}>
                    {c.desc}
                  </p>
                </div>
              </div>
              {idx % 2 === 1 ? (
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07]"
                  style={{ background: c.accent }}
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>

        <div
          className="mx-auto mt-12 max-w-3xl rounded-2xl border px-6 py-6 text-center"
          style={{
            borderColor: "color-mix(in srgb, var(--color-accent-primary) 30%, var(--color-border-default))",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-accent-soft) 50%, transparent), color-mix(in srgb, var(--color-bg-surface) 90%, transparent))",
            boxShadow: "0 16px 48px -28px color-mix(in srgb, var(--color-accent-primary) 25%, transparent)",
          }}
        >
          <div className="mb-3 flex justify-center">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-bg-muted)",
                color: "var(--color-accent-primary)",
              }}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
          </div>
          <p className="text-balance text-base font-semibold leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
            {t("painPoints.closing")}
          </p>
        </div>
      </div>
    </section>
  )
}
