"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

interface PromoFooterProps {
  registerHref: string
}

export function PromoFooter({ registerHref }: PromoFooterProps) {
  const { t, locale } = useI18n()
  return (
    <footer
      className="border-t py-8"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          © {new Date().getFullYear()} OptRouter. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href={`/${locale}`}
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t("promo.footerHome")}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t("promo.footerLogin")}
          </Link>
          <Link
            href={registerHref}
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t("promo.footerRegister")}
          </Link>
        </div>
      </div>
    </footer>
  )
}
