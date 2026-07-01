import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Navbar } from '../../(home)/components/navbar'
import { Footer } from '@/components/footer'
import { BlogArticleBody, BlogNewsCard } from '@/components/blog/blog-news'
import {
  getBlogArticle,
  getAllBlogSlugs,
  buildBlogMetadata,
  buildBlogArticleJsonLd,
  buildBlogFaqJsonLd,
  getRelatedArticles,
} from '@/lib/news'
import '@/styles/news-prose.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const article = await getBlogArticle(slug)
  if (!article) return { title: '文章未找到' }
  return buildBlogMetadata(article, locale)
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function BlogSlugPage({ params }: Props) {
  const { locale, slug } = await params
  const article = await getBlogArticle(slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.slug, article.category, 3)
  const articleJsonLd = buildBlogArticleJsonLd(article, locale)
  const faqJsonLd = buildBlogFaqJsonLd(article)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <BlogArticleBody article={article} locale={locale} />

          {related.length > 0 && (
            <section className="max-w-6xl mx-auto mt-24 space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-brand)' }}>
                  Related
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  相关阅读
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((a) => (
                  <BlogNewsCard key={a.slug} article={a} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
