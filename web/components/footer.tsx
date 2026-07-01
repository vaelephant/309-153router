'use client'

import Link from 'next/link'

import { ThemeToggle } from '@/app/[locale]/(home)/components/theme-toggle'
import { useI18n } from '@/lib/i18n-context'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  return (
    <footer
      className="border-t py-6"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div
        className="mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:gap-0"
        style={{ maxWidth: 'var(--layout-max-width)' }}
      >
        <p className="text-xs text-[var(--color-text-muted)]">
          {t('footer.copyright', { year: String(year) })}
        </p>
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-body)]">
          <Link
            href="/agents"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
          >
            Agent
          </Link>
          <span className="text-[var(--color-border-default)]" aria-hidden>
            |
          </span>
          <span className="flex items-center" title={t('footer.themeToggle')}>
            <ThemeToggle />
          </span>
        </div>
      </div>
    </footer>
  )
}
