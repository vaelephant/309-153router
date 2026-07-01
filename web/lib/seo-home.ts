import type { Metadata } from 'next'

import { getSiteUrl } from '@/lib/site-url'

const OG_LOCALE: Record<string, string> = {
  zh: 'zh_CN',
  en: 'en_US',
  ja: 'ja_JP',
}

type FaqMessages = {
  q0: string
  a0: string
  q1: string
  a1: string
  q2: string
  a2: string
  q3: string
  a3: string
  q4: string
  a4: string
  q5: string
  a5: string
}

type HomeMessages = {
  home: { title: string; description: string }
  faq: FaqMessages
  common: { siteName: string }
}

export function buildHomeMetadata(locale: string, messages: HomeMessages): Metadata {
  const siteUrl = getSiteUrl()
  const home = messages.home
  const canonical = `${siteUrl}/${locale}`
  const ogLocale = OG_LOCALE[locale] ?? OG_LOCALE.zh
  const ogImage = `${siteUrl}/opengraph-image`

  return {
    title: home.title,
    description: home.description,
    alternates: {
      canonical,
      languages: {
        'zh-CN': `${siteUrl}/zh`,
        en: `${siteUrl}/en`,
        ja: `${siteUrl}/ja`,
        'x-default': `${siteUrl}/zh`,
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      alternateLocale: ['zh_CN', 'en_US', 'ja_JP'].filter((l) => l !== ogLocale),
      url: canonical,
      siteName: messages.common.siteName,
      title: home.title,
      description: home.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: home.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: home.title,
      description: home.description,
      images: [ogImage],
    },
  }
}

export function buildHomeJsonLd(locale: string, messages: HomeMessages) {
  const siteUrl = getSiteUrl()
  const { home, faq, common } = messages
  const pageUrl = `${siteUrl}/${locale}`

  const faqEntities = [
    { q: faq.q0, a: faq.a0 },
    { q: faq.q1, a: faq.a1 },
    { q: faq.q2, a: faq.a2 },
    { q: faq.q3, a: faq.a3 },
    { q: faq.q4, a: faq.a4 },
    { q: faq.q5, a: faq.a5 },
  ].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: common.siteName,
        url: siteUrl,
        logo: { '@type': 'ImageObject', url: `${siteUrl}/icon.svg` },
        description: home.description,
      },
      {
        '@type': 'WebSite',
        '@id': `${pageUrl}#website`,
        url: pageUrl,
        name: common.siteName,
        inLanguage: locale,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        name: `${common.siteName} API`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        url: pageUrl,
        description: home.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: locale === 'en' ? 'USD' : 'CNY',
          description: locale === 'en' ? 'Free signup, pay as you go' : '免费注册，按量付费',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqEntities,
      },
    ],
  }
}
