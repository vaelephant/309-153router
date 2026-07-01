import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site-url'

import { getAllBlogArticles } from './blog-queries'

const LOCALES = ['zh', 'en', 'ja'] as const

export function getBlogSitemapEntries(): MetadataRoute.Sitemap {
  const articles = getAllBlogArticles()
  const siteUrl = getSiteUrl()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({
      url: `${siteUrl}/${locale}/blog`,
      lastModified: articles[0] ? new Date(articles[0].updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    })

    for (const article of articles) {
      entries.push({
        url: `${siteUrl}/${locale}/blog/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.75,
      })
    }
  }

  return entries
}
