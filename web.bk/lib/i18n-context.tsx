'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createT, type Locale, type Messages } from './i18n'

type I18nContextValue = {
  locale: Locale
  messages: Messages
  t: ReturnType<typeof createT>
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const t = useMemo(() => createT(messages), [messages])

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return
      const segments = pathname.split('/').filter(Boolean)
      const firstIsLocale = segments[0] && ['zh', 'en', 'ja'].includes(segments[0])
      const rest = firstIsLocale ? segments.slice(1) : segments
      const newPath = '/' + [newLocale, ...rest].join('/')
      router.push(newPath)
    },
    [locale, pathname, router]
  )

  const value = useMemo(
    () => ({ locale, messages, t, setLocale }),
    [locale, messages, t, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
