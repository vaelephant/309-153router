"use client"

import { LocaleLink } from "@/components/locale-link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Copy, Check } from "lucide-react"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { LayoutTextFlip } from "./layout-text-flip"
import { useI18n } from "@/lib/i18n-context"

const CURL_COMMAND = `curl https://api.optrouter.com/v1/chat/completions -H 'Authorization: Bearer YOUR_API_KEY' -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`
const COPY_RESET_MS = 2000
const TRUST_TECHS = ["OpenAI SDK", "Ollama SDK", "Google Gemini", "Anthropic Claude", "OpenRouter"]

export function Hero() {
  const { t } = useI18n()
  const flipWords = useMemo(
    () => [t("hero.flipWord0"), t("hero.flipWord1"), t("hero.flipWord2"), t("hero.flipWord3"), t("hero.flipWord4")],
    [t]
  )
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CURL_COMMAND)
      copyTimeoutRef.current && clearTimeout(copyTimeoutRef.current)
      setCopied(true)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch {
      // Fallback or ignore when clipboard fails (e.g. non-HTTPS)
    }
  }, [])

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [])

  return (
    <section
      className="hero relative min-h-screen overflow-hidden"
      aria-label={t("hero.ariaLabel")}
    >
      <div
        className="hero-glow absolute inset-0 -z-10 pointer-events-none"
        aria-hidden
      />

      <div className="hero-inner relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
        <h1
          className="hero-title"
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <LayoutTextFlip
            text={t("hero.oneApi")}
            words={flipWords}
            duration={3000}
            wordClassName="text-[var(--color-brand)] dark:text-white"
          />
        </h1>

        <p className="hero-subtitle" style={{ marginBottom: 'var(--space-3)' }}>
          {t("hero.subtitle1")}
        </p>
        <p className="hero-subtitle" style={{ marginTop: 0, marginBottom: 'var(--space-7)' }}>
          {t("hero.subtitle2")}
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <LocaleLink href="/login">
            <Button className="ds-btn-primary h-10 px-5 text-sm">
              {t("hero.cta")}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Button>
          </LocaleLink>

          <button
            type="button"
            onClick={copyCommand}
            className="hero-copy-btn flex h-10 items-center gap-2.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 text-sm text-[var(--color-text-body)] transition-colors hover:border-[var(--color-accent-primary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            aria-label={copied ? t("common.copied") : t("common.copyCurl")}
          >
            <span className="text-[var(--color-accent-primary)]" aria-hidden>$</span>
            <span className="hidden sm:inline">curl api.optrouter.com/v1</span>
            <span className="sm:hidden">{t("hero.viewApi")}</span>
            {copied ? (
              <Check className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden />
            ) : (
              <Copy className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
            )}
          </button>
        </div>

        <div className="hero-trust mt-32 flex flex-col items-center gap-5">
          <p className="hero-trust-label">{t("hero.trustLabel")}</p>
          <div className="hero-trust-list flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-60">
            {TRUST_TECHS.map((tech) => (
              <span key={tech} className="text-[15px] font-medium text-[var(--color-text-secondary)]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
