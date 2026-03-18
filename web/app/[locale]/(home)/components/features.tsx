"use client"

import { Zap, Shield, Globe, Code, BarChart3, Route } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const FEATURE_ICONS = [Route, Code, Globe, Zap, BarChart3, Shield]

export function Features() {
  const { t } = useI18n()
  const features = [
    { icon: FEATURE_ICONS[0], titleKey: "features.item0Title", descKey: "features.item0Desc" },
    { icon: FEATURE_ICONS[1], titleKey: "features.item1Title", descKey: "features.item1Desc" },
    { icon: FEATURE_ICONS[2], titleKey: "features.item2Title", descKey: "features.item2Desc" },
    { icon: FEATURE_ICONS[3], titleKey: "features.item3Title", descKey: "features.item3Desc" },
    { icon: FEATURE_ICONS[4], titleKey: "features.item4Title", descKey: "features.item4Desc" },
    { icon: FEATURE_ICONS[5], titleKey: "features.item5Title", descKey: "features.item5Desc" },
  ]
  return (
    <section 
      id="features" 
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
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t("features.title")}
          </h2>
          <p 
            style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: 'var(--color-text-body)',
              marginTop: 'var(--space-4)',
            }}
          >
            {t("features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div 
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            marginTop: 'var(--space-8)',
            gap: 'var(--space-5)',
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="ds-card group"
              style={{
                padding: 'var(--space-6)',
              }}
            >
              <div 
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {t(feature.titleKey)}
              </h3>
              <p 
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--color-text-body)',
                  marginTop: 'var(--space-2)',
                }}
              >
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
