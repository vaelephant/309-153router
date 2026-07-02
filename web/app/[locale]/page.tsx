import type { Metadata } from 'next'
import { Navbar } from './(home)/components/navbar'
import { Hero } from './(home)/components/hero'
import { HomeNewsSection } from './(home)/components/home-news-section'
import { HomeDeferredSections } from './(home)/components/home-deferred-sections'
import zhMessages from '@/messages/zh.json'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import { buildHomeJsonLd, buildHomeMetadata } from '@/lib/seo-home'

type Props = { params: Promise<{ locale: string }> }

const MESSAGES_BY_LOCALE = {
  zh: zhMessages,
  en: enMessages,
  ja: jaMessages,
} as const

function getMessages(locale: string) {
  return MESSAGES_BY_LOCALE[locale as keyof typeof MESSAGES_BY_LOCALE] ?? zhMessages
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildHomeMetadata(locale, getMessages(locale) as Parameters<typeof buildHomeMetadata>[1])
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const messages = getMessages(locale)
  const jsonLd = buildHomeJsonLd(locale, messages as Parameters<typeof buildHomeJsonLd>[1])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <Hero />
      <HomeNewsSection locale={locale} />
      <HomeDeferredSections />
    </main>
  )
}
