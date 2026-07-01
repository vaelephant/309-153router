import { Navbar } from '../(home)/components/navbar'
import { Footer } from '@/components/footer'
import { BlogNewsCard } from '@/components/blog/blog-news'
import { BlogCategoryFilter } from '@/components/blog/blog-category-filter'
import { BlogPageTitle } from './blog-page-title'
import { BlogEmptyState } from './blog-empty-state'
import { getMergedBlogArticles } from '@/lib/news'
import { BLOG_CATEGORIES } from '@/lib/news/blog-categories'
import type { BlogCategory } from '@/lib/news/article-types'
import '@/styles/news-prose.css'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; tag?: string }>
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, tag } = await searchParams

  const activeCategory: BlogCategory | 'all' =
    category && (BLOG_CATEGORIES as string[]).includes(category)
      ? (category as BlogCategory)
      : 'all'

  let articles = await getMergedBlogArticles()

  if (activeCategory !== 'all') {
    articles = articles.filter((a) => a.category === activeCategory)
  }

  if (tag) {
    articles = articles.filter((item) => item.tags.includes(tag))
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <header className="text-center mb-8">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-brand)' }}
            >
              News
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <BlogPageTitle />
            </h1>
            <p className="text-sm max-w-2xl mx-auto mb-6" style={{ color: 'var(--color-text-body)' }}>
              AI 网关、模型路由与开发者实践
            </p>
            <BlogCategoryFilter locale={locale} activeCategory={activeCategory} />
          </header>

          {articles.length === 0 ? (
            <BlogEmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((item) => (
                <BlogNewsCard key={item.slug} article={item} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
