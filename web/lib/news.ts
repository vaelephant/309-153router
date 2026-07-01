import type { BlogArticle, BlogCategory, BlogFaq } from './news/article-types'
import { getBlogCoverUrl } from './news/blog-cover'
import {
  getAllBlogArticles,
  getBlogBySlug,
  getLatestBlogArticles,
  getRelatedBlogArticles,
  getAllBlogSlugs,
  getBlogByCategory,
} from './news/blog-queries'

export type { BlogArticle, BlogCategory, BlogFaq } from './news/article-types'
export {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_DESCRIPTIONS,
} from './news/blog-categories'
export {
  getAllBlogArticles,
  getBlogBySlug,
  getLatestBlogArticles,
  getRelatedBlogArticles,
  getAllBlogSlugs,
  getBlogByCategory,
} from './news/blog-queries'
export { getBlogCoverUrl } from './news/blog-cover'
export {
  buildBlogArticleJsonLd,
  buildBlogFaqJsonLd,
  buildBlogMetadata,
} from './news/blog-json-ld'
export { getBlogSitemapEntries } from './news/sitemap-entries'

/** @deprecated 兼容旧组件，等同 BlogArticle 的简化视图 */
export interface NewsItem {
  slug: string
  title: string
  date: string
  coverImage: string
  excerpt: string
  content: string
  tags?: string[]
  readTimeMinutes?: number
  faqs?: BlogFaq[]
  category?: string
  source?: 'markdown'
}

function blogToNewsItem(article: BlogArticle): NewsItem {
  return {
    slug: article.slug,
    title: article.title,
    date: article.publishedAt,
    coverImage: getBlogCoverUrl(article),
    excerpt: article.summary,
    content: article.content,
    tags: article.tags.length ? article.tags : undefined,
    readTimeMinutes: article.readingMinutes,
    faqs: article.faqs.length ? article.faqs : undefined,
    category: article.category,
    source: 'markdown',
  }
}

export async function getAllNews(): Promise<NewsItem[]> {
  return getAllBlogArticles().map(blogToNewsItem)
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  const article = getBlogBySlug(slug)
  return article ? blogToNewsItem(article) : null
}

export async function getBlogArticle(slug: string): Promise<BlogArticle | null> {
  return getBlogBySlug(slug)
}

export async function getMergedBlogArticles(): Promise<BlogArticle[]> {
  return getAllBlogArticles()
}

export async function getLatestMergedBlogArticles(
  limit: number
): Promise<BlogArticle[]> {
  return getLatestBlogArticles(limit)
}

export async function getRelatedArticles(
  currentSlug: string,
  category: BlogCategory,
  limit: number
): Promise<BlogArticle[]> {
  return getRelatedBlogArticles(currentSlug, category, limit)
}
