"use client"

import { LocaleLink } from "@/components/locale-link"
import { Button } from "@/components/ui/button"
import { Activity, ArrowRight, BookOpen, Building2, Gauge, GitBranch, Plug, ShieldCheck } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n-context"

const TRUST_TECHS = ["OpenAI SDK", "Ollama SDK", "Google Gemini", "Anthropic Claude", "OpenRouter"]
const PILL_ICONS = [Plug, GitBranch] as const

function HeroRoutingArt({ className }: { className?: string }) {
  const raw = useId()
  const uid = raw.replace(/:/g, "")
  const lineId = `hero-routing-line-${uid}`
  const surfaceId = `hero-routing-surface-${uid}`

  const nodes = useMemo(
    () => [
      { label: "OpenAI", x: 260, y: 70 },
      { label: "Claude", x: 252, y: 190 },
      { label: "Gemini", x: 70, y: 72 },
      { label: "DeepSeek", x: 58, y: 190 },
    ],
    []
  )
  const hub = { x: 160, y: 130 }

  return (
    <svg
      className={className}
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={lineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id={surfaceId} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="var(--color-accent-soft)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-bg-surface)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="280" fill={`url(#${surfaceId})`} rx="24" />
      <circle cx={160} cy={130} r="112" fill="none" stroke="var(--color-border-default)" strokeOpacity="0.25" strokeWidth="1" />
      <g transform="translate(160 130)">
        <circle r="72" fill="none" stroke="var(--color-accent-primary)" strokeOpacity="0.16" strokeWidth="1.2" strokeDasharray="4 7">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0"
            to="360"
            dur="22s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      {nodes.map((n, i) => (
        <line
          key={i}
          x1={hub.x}
          y1={hub.y}
          x2={n.x}
          y2={n.y}
          stroke={`url(#${lineId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        >
          <animate
            attributeName="opacity"
            values="0.22;0.72;0.22"
            dur="3.4s"
            begin={`${i * 0.35}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
      {nodes.map((n, i) => (
        <circle key={`flow-${i}`} r="2.6" fill="var(--color-accent-primary)" opacity="0.85">
          <animateMotion
            dur={`${2.2 + i * 0.25}s`}
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
            path={`M ${hub.x} ${hub.y} L ${n.x} ${n.y}`}
          />
          <animate
            attributeName="opacity"
            values="0;0.92;0"
            dur={`${2.2 + i * 0.25}s`}
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      {nodes.map((n, i) => (
        <g key={`o-${i}`}>
          <circle cx={n.x} cy={n.y} r="7" fill="var(--color-bg-surface)" stroke={`url(#${lineId})`} strokeWidth="1.6" />
          <circle cx={n.x} cy={n.y} r="10" fill="none" stroke="var(--color-accent-primary)" strokeOpacity="0.22" strokeWidth="1">
            <animate
              attributeName="r"
              values="8;12;8"
              dur={`${2.8 + i * 0.2}s`}
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.1;0.35;0.1"
              dur={`${2.8 + i * 0.2}s`}
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={n.x}
            y={n.y < hub.y ? n.y - 14 : n.y + 20}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-secondary)"
            fontWeight="600"
          >
            {n.label}
          </text>
        </g>
      ))}
      <circle
        cx={hub.x}
        cy={hub.y}
        r="28"
        fill="color-mix(in srgb, var(--color-accent-soft) 72%, var(--color-bg-surface))"
        stroke={`url(#${lineId})`}
        strokeWidth="2.4"
      >
        <animate
          attributeName="r"
          values="26;30;26"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={hub.x} cy={hub.y} r="8" fill="var(--color-accent-primary)" opacity="0.88" />
      <circle cx={hub.x} cy={hub.y} r="14" fill="none" stroke="var(--color-accent-primary)" strokeOpacity="0.24" strokeWidth="1.2">
        <animate attributeName="r" values="12;18;12" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.12;0.35;0.12" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <rect
        x="98"
        y="232"
        width="124"
        height="24"
        rx="12"
        fill="color-mix(in srgb, var(--color-bg-surface) 92%, var(--color-accent-soft))"
        stroke="color-mix(in srgb, var(--color-accent-primary) 28%, transparent)"
      />
      <text x={hub.x} y="248" textAnchor="middle" fontSize="10.5" fill="var(--color-text-muted)" fontWeight="500">
        Smart Routing · Auto Failover
      </text>
    </svg>
  )
}

export function Hero() {
  const { t } = useI18n()
  const pillLabels = [t("hero.pill1"), t("hero.pill2")]
  const pills = PILL_ICONS.map((Icon, i) => ({ Icon, label: pillLabels[i]! }))
  const [latencyMs, setLatencyMs] = useState(142)
  const [costSaving, setCostSaving] = useState(37)
  const [failoverState, setFailoverState] = useState<"ready" | "monitoring">("ready")

  useEffect(() => {
    const timer = setInterval(() => {
      setLatencyMs((prev) => {
        const next = prev + Math.round((Math.random() - 0.5) * 14)
        return Math.max(112, Math.min(196, next))
      })
      setCostSaving((prev) => {
        const next = prev + Math.round((Math.random() - 0.5) * 3)
        return Math.max(31, Math.min(42, next))
      })
      // 少量状态波动，避免过于“假”
      const dice = Math.random()
      if (dice < 0.1) setFailoverState("monitoring")
      else setFailoverState("ready")
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      className="hero relative min-h-screen overflow-hidden"
      aria-label={t("hero.ariaLabel")}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.45] dark:opacity-[0.28]"
        style={{
          backgroundImage: `radial-gradient(circle at center, var(--color-border-default) 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      <div className="hero-glow absolute inset-0 -z-10 pointer-events-none" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full opacity-30 blur-[100px] sm:h-96 sm:w-96"
        style={{ background: "var(--color-accent-primary)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-64 w-64 rounded-full opacity-[0.18] blur-[90px] sm:h-80 sm:w-80"
        style={{ background: "var(--color-brand)" }}
        aria-hidden
      />

      <div className="hero-inner relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-6 pb-12 pt-8 lg:px-8 lg:pt-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0 flex-1 text-center lg:max-w-xl lg:text-left xl:max-w-2xl">
            <p
              className="mb-5 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide lg:justify-start"
              style={{
                color: "var(--color-accent-primary)",
                backgroundColor: "color-mix(in srgb, var(--color-accent-soft) 80%, transparent)",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "color-mix(in srgb, var(--color-accent-primary) 22%, transparent)",
              }}
            >
              {t("hero.badge")}
            </p>

            <h1
              className="hero-title"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-5)",
              }}
            >
              <span className="block">{t("hero.headline1")}</span>
              <span
                className="mt-3 block"
                style={{
                  fontSize: "clamp(17px, 2vw, 22px)",
                  fontWeight: 500,
                  color: "color-mix(in srgb, var(--color-accent-primary) 62%, var(--color-text-secondary))",
                }}
              >
                {t("hero.headline2")}
              </span>
            </h1>

            <div className="mb-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {pills.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide ring-1 ring-black/5 dark:ring-white/8"
                  style={{
                    backgroundColor: "var(--color-bg-muted)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" style={{ color: "var(--color-accent-primary)" }} aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            <div className="mb-8 flex justify-center lg:hidden">
              <div
                className="w-full max-w-80 rounded-2xl p-3.5 shadow-lg ring-1 ring-black/4 dark:ring-white/6"
                style={{
                  background:
                    "linear-gradient(145deg, color-mix(in srgb, var(--color-bg-surface) 92%, var(--color-accent-soft)), var(--color-bg-muted))",
                }}
              >
                <HeroRoutingArt className="h-auto w-full" />
              </div>
            </div>

            <p
              className="mb-10 max-w-xl text-pretty text-base leading-relaxed sm:text-[17px] lg:mx-0"
              style={{ color: "var(--color-text-body)" }}
            >
              {t("hero.subtitle")}
            </p>

            <div className="mx-auto flex w-full max-w-md flex-col gap-5 sm:max-w-lg lg:mx-0">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <LocaleLink href="/login" className="sm:min-w-44 sm:flex-1 lg:max-w-52">
                  <Button className="ds-btn-primary h-11 w-full px-6 text-sm sm:h-10">
                    {t("hero.ctaPrimary")}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                  </Button>
                </LocaleLink>
                <Button variant="outline" className="h-11 w-full text-sm sm:h-10 sm:min-w-44 sm:flex-1 lg:max-w-52" asChild>
                  <a href="#contact">{t("hero.ctaDemo")}</a>
                </Button>
              </div>
              <div
                className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[15px] lg:justify-start"
                style={{ color: "var(--color-text-body)" }}
              >
                <a
                  href="#integration"
                  className="inline-flex items-center gap-1.5 font-medium text-(--color-text-muted) underline-offset-4 transition-colors hover:text-(--color-text-secondary) hover:underline"
                >
                  <BookOpen className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  {t("hero.linkDocs")}
                </a>
                <span style={{ color: "var(--color-text-muted)" }} aria-hidden>
                  ·
                </span>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 font-medium text-(--color-text-muted) underline-offset-4 transition-colors hover:text-(--color-text-secondary) hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  {t("hero.linkEnterprise")}
                </a>
              </div>
            </div>

            <p
              className="mt-6 max-w-xl text-pretty text-xs leading-relaxed sm:text-sm lg:mx-0"
              style={{ color: "var(--color-text-muted)" }}
            >
              {t("hero.tagline")}
            </p>

            <div
              className="hero-trust mt-7 rounded-xl px-4 py-3 lg:mt-8"
              style={{
                border: "1px solid var(--color-border-default)",
                backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 90%, transparent)",
              }}
            >
              <p className="text-xs font-medium tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                {t("hero.trustLabel")}
              </p>
              <p
                className="mt-1.5 max-w-xl text-xs leading-relaxed sm:text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {TRUST_TECHS.join(" · ")}
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 lg:flex lg:w-[min(42%,23rem)] xl:w-96 lg:justify-end">
            <div
              className="w-full rounded-2xl p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/8"
              style={{
                background:
                  "linear-gradient(155deg, color-mix(in srgb, var(--color-bg-surface) 90%, var(--color-accent-soft)), var(--color-bg-muted))",
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  {t("hero.snapshotTitle")}
                </p>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    color: "var(--color-accent-primary)",
                    backgroundColor: "color-mix(in srgb, var(--color-accent-soft) 72%, transparent)",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-(--color-accent-primary)" />
                  {t("hero.snapshotLive")}
                </span>
              </div>
              <HeroRoutingArt className="h-auto w-full" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div
                  className="rounded-lg px-2.5 py-2 text-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 86%, transparent)" }}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                    <Gauge className="h-3 w-3" />
                    {t("hero.metricLatency")}
                  </div>
                  <p className="mt-1 text-xs font-semibold tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                    {latencyMs}ms
                  </p>
                </div>
                <div
                  className="rounded-lg px-2.5 py-2 text-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 86%, transparent)" }}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                    <Activity className="h-3 w-3" />
                    {t("hero.metricCost")}
                  </div>
                  <p className="mt-1 text-xs font-semibold tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                    -{costSaving}%
                  </p>
                </div>
                <div
                  className="rounded-lg px-2.5 py-2 text-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-bg-surface) 86%, transparent)" }}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                    <ShieldCheck className="h-3 w-3" />
                    {t("hero.metricFailover")}
                  </div>
                  <p className="mt-1 text-xs font-semibold" style={{ color: failoverState === "ready" ? "var(--color-text-secondary)" : "var(--color-accent-primary)" }}>
                    {failoverState === "ready" ? t("hero.statusReady") : t("hero.statusMonitoring")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
