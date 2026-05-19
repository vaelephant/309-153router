'use client'

import { useEffect } from 'react'
import type { Locale } from '@/lib/i18n'

const LOCALE_TO_LANG: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en',
  ja: 'ja',
}

export function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = LOCALE_TO_LANG[locale]
  }, [locale])
  return null
}
