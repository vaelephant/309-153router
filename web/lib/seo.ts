import type { Metadata } from 'next'

import { loadBrandConfig } from '@/lib/load-brand'
import { getSiteUrl } from '@/lib/site-url'

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

const brandConfig = loadBrandConfig()

export const productCore = {
  positioning: brandConfig.productCore.positioning,
  pillars: brandConfig.productCore.pillars,
  capabilities: brandConfig.productCore.capabilities,
} as const

function pillarsAsList(pillars: string): string {
  return pillars.replace(/\s*\|\s*/g, '、')
}

export const siteSeo = {
  name: brandConfig.brand.name,
  shortName: brandConfig.brand.shortName,
  title: `${brandConfig.brand.name} — ${brandConfig.productCore.positioning}`,
  description:
    `${brandConfig.brand.name}：${brandConfig.productCore.positioning}。${pillarsAsList(brandConfig.productCore.pillars)}——` +
    brandConfig.seo.descriptionSuffix,
  keywords: brandConfig.seo.keywords,
  twitter: brandConfig.brand.twitter,
  themeColor: brandConfig.brand.themeColor,
} as const

const ogShortDesc = {
  descriptionFontSize: brandConfig.og.shortDescriptionFontSize,
}

export const ogCopy = {
  tagline: brandConfig.brand.ogTagline,
  features: productCore.capabilities,
  home: {
    title: productCore.positioning,
    description: productCore.pillars,
    ...ogShortDesc,
  },
  blog: brandConfig.og.blog,
  register: brandConfig.og.register,
  invite: brandConfig.og.invite,
} as const

export { getSiteUrl, absoluteUrl } from '@/lib/site-url'

/** 对外可索引的公开路由（sitemap 用，路径不含 locale 前缀的需单独处理）。 */
export const publicRoutes: {
  path: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}[] = [
  { path: '/agents', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/zh', changeFrequency: 'weekly', priority: 1 },
  { path: '/en', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ja', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/zh/blog', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/zh/login', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/zh/register', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/zh/promo', changeFrequency: 'weekly', priority: 0.8 },
]

export const rootMetadata: Metadata = {
  ...buildMetadata({
    title: siteSeo.title,
    description: siteSeo.description,
    keywords: [...siteSeo.keywords],
  }),
  title: {
    default: siteSeo.title,
    template: `%s | ${siteSeo.shortName}`,
  },
  authors: [{ name: siteSeo.name, url: getSiteUrl() }],
  creator: siteSeo.name,
  publisher: siteSeo.name,
}

type BuildMetadataOptions = {
  title: string
  description: string
  path?: string
  autoOgImage?: boolean
  ogImagePath?: string
  noIndex?: boolean
  keywords?: string[]
  openGraphType?: 'website' | 'article'
  article?: {
    publishedTime: string
    modifiedTime: string
    section?: string
    tags?: string[]
  }
}

function defaultOgImagePath(path?: string): string {
  if (!path || path === '/') return '/opengraph-image'
  const normalized = path.replace(/^\/(zh|en|ja)/, '')
  if (!normalized || normalized === '/') return '/opengraph-image'
  return `${normalized}/opengraph-image`
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const siteUrl = getSiteUrl()
  const canonical = options.path ? `${siteUrl}${options.path}` : siteUrl
  const ogType = options.openGraphType ?? 'website'
  const ogImage = options.ogImagePath ?? defaultOgImagePath(options.path)
  const includeOgImage = !options.autoOgImage

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    metadataBase: new URL(siteUrl),
    alternates: options.path ? { canonical } : undefined,
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large' as const,
          },
        },
    openGraph: {
      type: ogType,
      locale: 'zh_CN',
      url: canonical,
      siteName: siteSeo.name,
      title: options.title,
      description: options.description,
      ...(includeOgImage && {
        images: [
          {
            url: ogImage,
            width: OG_IMAGE_SIZE.width,
            height: OG_IMAGE_SIZE.height,
            alt: options.title,
          },
        ],
      }),
      ...(options.article && {
        publishedTime: options.article.publishedTime,
        modifiedTime: options.article.modifiedTime,
        section: options.article.section,
        tags: options.article.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      creator: siteSeo.twitter,
      ...(includeOgImage && { images: [ogImage] }),
    },
  }
}
