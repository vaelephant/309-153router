'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { LOCALES, type Locale } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://optrouter.com'

export function HreflangLinks() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const firstIsLocale = segments[0] && LOCALES.includes(segments[0] as Locale)
  const pathWithoutLocale = firstIsLocale ? '/' + segments.slice(1).join('/') : pathname

  useEffect(() => {
    const links = LOCALES.map((locale) => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = locale === 'zh' ? 'zh-CN' : locale
      link.href = `${SITE_URL}/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
      return link
    })
    links.forEach((link) => document.head.appendChild(link))
    return () => links.forEach((link) => link.remove())
  }, [pathWithoutLocale])

  return null
}
