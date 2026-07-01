import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, Camera } from 'lucide-react'

import { NewsMarkdown } from '@/components/blog/news-markdown'
import type { BlogArticle } from '@/lib/news/article-types'
import { BLOG_CATEGORY_LABELS } from '@/lib/news/blog-categories'
import { getBlogCoverUrl } from '@/lib/news/blog-cover'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

export function BlogNewsCard({
  article,
  locale,
}: {
  article: BlogArticle
  locale: string
}) {
  const href = `/${locale}/blog/${article.slug}`
  const cover = getBlogCoverUrl(article, { width: 1200, height: 675 })

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl overflow-hidden border transition-all hover:shadow-lg"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-muted)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={article.cover?.alt || article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-sm"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            color: 'var(--color-brand)',
          }}
        >
          {BLOG_CATEGORY_LABELS[article.category]}
        </div>
      </div>
      <div className="flex flex-col flex-1 p-6 space-y-3">
        <h3
          className="text-lg font-bold leading-snug line-clamp-2 group-hover:opacity-90 transition-colors"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {article.title}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--color-text-body)' }}>
          {article.summary}
        </p>
        <div
          className="flex items-center justify-between pt-4 mt-auto border-t text-xs"
          style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <Clock size={11} />
            {article.readingMinutes} 分钟 · {article.publishedAt}
          </span>
          <span
            className="flex items-center gap-1 font-medium group-hover:gap-2 transition-all"
            style={{ color: 'var(--color-brand)' }}
          >
            阅读 <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function BlogArticleBody({
  article,
  locale,
}: {
  article: BlogArticle
  locale: string
}) {
  const cover = getBlogCoverUrl(article, { width: 1600, height: 720 })
  const attribution = article.cover?.photographer ? article.cover : null

  return (
    <article className="max-w-[720px] mx-auto">
      <header className="space-y-8 mb-14">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={12} /> 返回新闻资讯
        </Link>

        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
          style={{
            backgroundColor: 'var(--color-bg-page)',
            color: 'var(--color-brand)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          {BLOG_CATEGORY_LABELS[article.category]}
        </span>

        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {article.title}
        </h1>

        <p className="text-lg sm:text-xl leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
          {article.summary}
        </p>

        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs pt-4 border-t"
          style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {article.readingMinutes} 分钟阅读
          </span>
        </div>
      </header>

      <figure className="mb-14 -mx-4 sm:mx-0">
        <div
          className="rounded-2xl overflow-hidden aspect-[16/7] shadow-sm border"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={article.cover?.alt || article.title} className="w-full h-full object-cover" />
        </div>
        {attribution && (
          <figcaption className="mt-3 flex items-center gap-1.5 text-[11px] justify-center sm:justify-start" style={{ color: 'var(--color-text-muted)' }}>
            <Camera size={11} />
            Photo by{' '}
            <a
              href={attribution.photographerUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: 'var(--color-text-body)' }}
            >
              {attribution.photographer}
            </a>{' '}
            on Unsplash
          </figcaption>
        )}
      </figure>

      <NewsMarkdown content={article.content} />

      {article.faqs.length > 0 && (
        <section className="mt-20 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-brand)' }}>
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              常见问题
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-default)' }}>
            {article.faqs.map((f, i) => (
              <details key={i} className="group py-6 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <span className="text-base sm:text-lg font-semibold leading-snug pt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                    {f.question}
                  </span>
                  <span
                    className="mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform group-open:rotate-45"
                    style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-brand)' }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[15px] leading-relaxed pr-12" style={{ color: 'var(--color-text-body)' }}>
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {article.tags.length > 0 && (
        <div className="mt-16 flex flex-wrap items-center gap-2 pt-8 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
          <Tag size={12} style={{ color: 'var(--color-text-muted)' }} />
          {article.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded"
              style={{
                backgroundColor: 'var(--color-bg-page)',
                color: 'var(--color-text-body)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div
        className="mt-16 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border"
        style={{
          borderColor: 'var(--color-border-default)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        <div className="relative z-10 space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            准备好接入统一 AI 网关了吗？
          </h3>
          <p className="text-base sm:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
            免费注册，OpenAI 兼容 API，智能路由与成本监控一站搞定。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href={`/${locale}/register`}
              className="w-full sm:w-auto px-8 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
            >
              免费开始使用
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="w-full sm:w-auto px-8 py-3 font-semibold rounded-lg border transition-opacity hover:opacity-90"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}
            >
              更多资讯
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
