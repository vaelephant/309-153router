"use client"

import { LocaleLink } from "@/components/locale-link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { buildAuthHref } from "@/lib/traffic-source"
import { useTrafficSource } from "@/lib/use-traffic-source"

export function AiGatewayStickyCta() {
  const { t, locale } = useI18n()
  const source = useTrafficSource()
  const registerHref = buildAuthHref(locale, "register", source)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{
        borderColor: "var(--color-border-default)",
        background: "color-mix(in srgb, var(--color-bg-page) 96%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex max-w-lg gap-3">
        <Button variant="outline" className="h-11 flex-1 text-sm" asChild>
          <a href="#wechat">{t("aiGateway.hero.secondaryCta")}</a>
        </Button>
        <LocaleLink href={registerHref} className="flex-[1.2]">
          <Button className="ds-btn-primary h-11 w-full text-sm font-semibold">
            {t("aiGateway.hero.primaryCta")}
          </Button>
        </LocaleLink>
      </div>
    </div>
  )
}
