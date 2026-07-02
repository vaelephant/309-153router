import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { BlogNewsCard } from '@/components/blog/blog-news'
import { getLatestMergedBlogArticles } from '@/lib/news'

export async function HomeNewsSection({ locale }: { locale: string }) {
  const articles = await getLatestMergedBlogArticles(3)
  if (articles.length === 0) return null

  return (
    <section
      id="news"
      className="border-t py-24"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-page)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-brand)' }}
            >
              News
            </span>
            <h2
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              新闻资讯
            </h2>
            <p className="max-w-lg text-sm" style={{ color: 'var(--color-text-body)' }}>
              关于 AI 网关、模型路由与开发者实践的持续输出。
            </p>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold group"
            style={{ color: 'var(--color-brand)' }}
          >
            查看全部
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <BlogNewsCard key={a.slug} article={a} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
