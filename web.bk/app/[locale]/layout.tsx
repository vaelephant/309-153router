import { notFound } from 'next/navigation'
import { I18nProvider } from '@/lib/i18n-context'
import { isValidLocale, type Locale } from '@/lib/i18n'
import { SetHtmlLang } from '@/components/set-html-lang'
import { HreflangLinks } from '@/components/hreflang-links'
import zhMessages from '@/messages/zh.json'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import type { Messages } from '@/lib/i18n'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const MESSAGES: Record<Locale, Messages> = {
  zh: zhMessages as Messages,
  en: enMessages as Messages,
  ja: jaMessages as Messages,
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) {
    notFound()
  }
  const messages = MESSAGES[locale]

  return (
    <>
      <SetHtmlLang locale={locale} />
      <HreflangLinks />
      <I18nProvider locale={locale} messages={messages}>
        {children}
      </I18nProvider>
    </>
  )
}

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }, { locale: 'ja' }]
}
