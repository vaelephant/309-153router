import type { BlogArticle, BlogCategory } from './article-types'

export function getBlogCoverUrl(
  article: Pick<BlogArticle, 'slug' | 'category' | 'cover' | 'coverImage'>,
  { width = 1200, height = 675 }: { width?: number; height?: number } = {}
): string {
  if (article.coverImage) {
    return article.coverImage.startsWith('/')
      ? article.coverImage
      : `/${article.coverImage}`
  }
  if (article.cover?.url) {
    return withUnsplashSize(article.cover.url, width, height)
  }
  return fallbackPicsum(article.category, article.slug, width, height)
}

function withUnsplashSize(url: string, w: number, h: number): string {
  const clean = url.split('?')[0]
  return `${clean}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

const CATEGORY_SEEDS: Record<BlogCategory, string[]> = {
  guide: ['blog-guide-1', 'blog-guide-2', 'blog-guide-3'],
  'deep-dive': ['blog-deep-1', 'blog-deep-2', 'blog-deep-3'],
  compare: ['blog-compare-1', 'blog-compare-2'],
  routing: ['blog-route-1', 'blog-route-2', 'blog-route-3'],
  product: ['blog-product-1', 'blog-product-2'],
}

function hashCode(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function fallbackPicsum(
  category: BlogCategory,
  seed: string,
  width: number,
  height: number
): string {
  const pool = CATEGORY_SEEDS[category]
  const pick = pool[hashCode(seed) % pool.length]
  return `https://picsum.photos/seed/${pick}-${seed}/${width}/${height}`
}
