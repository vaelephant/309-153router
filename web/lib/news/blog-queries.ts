import type { BlogArticle, BlogCategory } from './article-types'
import { loadMarkdownArticles } from './markdown-loader'

function sortedArticles(): BlogArticle[] {
  return loadMarkdownArticles().sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  )
}

export function getAllBlogArticles(): BlogArticle[] {
  return sortedArticles()
}

export function getBlogBySlug(slug: string): BlogArticle | undefined {
  return sortedArticles().find((a) => a.slug === slug)
}

export function getBlogByCategory(category: BlogCategory): BlogArticle[] {
  return sortedArticles().filter((a) => a.category === category)
}

export function getLatestBlogArticles(limit: number): BlogArticle[] {
  return sortedArticles().slice(0, limit)
}

export function getRelatedBlogArticles(
  currentSlug: string,
  category: BlogCategory,
  limit: number
): BlogArticle[] {
  const all = sortedArticles()
  const sameCategory = all.filter(
    (a) => a.category === category && a.slug !== currentSlug
  )
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)
  const filler = all
    .filter((a) => a.category !== category && a.slug !== currentSlug)
    .slice(0, limit - sameCategory.length)
  return [...sameCategory, ...filler]
}

export function getAllBlogSlugs(): string[] {
  return sortedArticles().map((a) => a.slug)
}
