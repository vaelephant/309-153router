export type BlogCategory =
  | 'guide'
  | 'deep-dive'
  | 'compare'
  | 'routing'
  | 'product'

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogCover {
  url: string
  photographer?: string
  photographerUrl?: string
  sourceUrl?: string
  alt?: string
}

export interface BlogArticle {
  slug: string
  title: string
  summary: string
  content: string
  category: BlogCategory
  tags: string[]
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  faqs: BlogFaq[]
  cover?: BlogCover
  /** Legacy local path e.g. /news/foo.png */
  coverImage?: string
  source: 'markdown' | 'db'
}
