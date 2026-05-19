"use client"

import { LocaleLink } from "@/components/locale-link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export function CTA() {
  const { t } = useI18n()
  return (
    <section 
      className="border-t py-24"
      style={{
        borderColor: 'var(--color-border-default)',
        paddingTop: 'var(--layout-section-spacing)',
        paddingBottom: 'var(--layout-section-spacing)',
      }}
    >
      <div 
        className="mx-auto px-6"
      >
        <div 
          className="relative overflow-hidden rounded-2xl border px-8 py-16 text-center sm:px-16"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-9) var(--space-7)',
          }}
        >
          <div className="relative">
            <h2 
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                maxWidth: '600px',
                margin: '0 auto var(--space-4)',
              }}
            >
              {t("cta.title")}
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "var(--color-text-body)",
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              {t("cta.subtitle")}
            </p>
            <div
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              style={{ marginTop: "var(--space-6)" }}
            >
              <LocaleLink href="/login">
                <Button
                  size="lg"
                  className="ds-btn-primary"
                  style={{
                    height: "48px",
                    padding: "14px 28px",
                  }}
                >
                  {t("cta.buttonStart")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </LocaleLink>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="#integration"
                  style={{
                    height: "48px",
                    padding: "14px 28px",
                    borderColor: "var(--color-button-secondary-border)",
                    color: "var(--color-button-secondary-text)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t("cta.buttonDocs")}
                </a>
              </Button>
            </div>
            <p
              className="mt-6 text-center text-sm"
              style={{ color: "var(--color-text-muted)", maxWidth: "480px", margin: "var(--space-6) auto 0" }}
            >
              <a
                href="#contact"
                className="font-medium underline-offset-4 hover:text-[var(--color-text-primary)] hover:underline"
              >
                {t("cta.enterpriseHint")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
