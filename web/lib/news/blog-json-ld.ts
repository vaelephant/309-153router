import type { BlogArticle } from './article-types'
import { getBlogCoverUrl } from './blog-cover'
import { BLOG_CATEGORY_LABELS } from './blog-categories'
import { getSiteUrl } from '@/lib/site-url'

export function blogAbsoluteUrl(locale: string, path: string): string {
  const siteUrl = getSiteUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}/${locale}${normalized.replace(/^\/(zh|en|ja)/, '')}`
}

export function buildBlogArticleJsonLd(article: BlogArticle, locale: string) {
  const siteUrl = getSiteUrl()
  const url = blogAbsoluteUrl(locale, `/blog/${article.slug}`)
  const image = getBlogCoverUrl(article)

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: [image.startsWith('http') ? image : `${siteUrl}${image}`],
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    articleSection: BLOG_CATEGORY_LABELS[article.category],
    keywords: article.tags.join(', '),
    author: {
      '@type': 'Organization',
      name: 'OptRouter',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'OptRouter',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

export function buildBlogFaqJsonLd(article: BlogArticle) {
  if (!article.faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

export function buildBlogMetadata(article: BlogArticle, locale: string) {
  const siteUrl = getSiteUrl()
  const image = getBlogCoverUrl(article)
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: blogAbsoluteUrl(locale, `/blog/${article.slug}`),
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article' as const,
      url: blogAbsoluteUrl(locale, `/blog/${article.slug}`),
      publishedTime: new Date(article.publishedAt).toISOString(),
      modifiedTime: new Date(article.updatedAt).toISOString(),
      images: [imageUrl],
    },
    keywords: article.tags,
  }
}
