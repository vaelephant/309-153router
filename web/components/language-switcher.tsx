'use client'

import { useI18n } from '@/lib/i18n-context'
import { LOCALES, type Locale } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

const LOCALE_LABELS: Record<Locale, string> = {
  zh: '中',
  en: '英',
  ja: '日',
}

export function LanguageSwitcher() {
  const { locale, t, setLocale } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-[13px] font-medium text-[var(--color-text-body)] hover:bg-transparent hover:text-[var(--color-text-primary)]"
          aria-label={t('common.language')}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[80px] shadow-none border border-[var(--color-border-default)]">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="focus:bg-[var(--color-bg-muted)] focus:text-[var(--color-text-primary)]"
          >
            {LOCALE_LABELS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
