import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "../../(home)/components/navbar"
import { Footer } from "@/components/footer"
import { MarkdownContent } from "@/components/markdown-content"
import { getNewsItem, getAllNews } from "@/lib/news"
import { BlogArticleContent } from "./blog-article-content"

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const news = await getNewsItem(slug)
  if (!news) return { title: "文章未找到" }
  return {
    title: news.title,
    description: news.excerpt || undefined,
    openGraph: news.coverImage ? { images: [news.coverImage] } : undefined,
  }
}

export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  const news = await getAllNews()
  return news.map((item) => ({ slug: item.slug }))
}

export default async function BlogSlugPage({ params }: Props) {
  const { locale, slug } = await params
  const news = await getNewsItem(slug)
  if (!news) notFound()

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg-page)" }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-6">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "var(--color-text-body)" }}
            >
              ← <BlogArticleContent type="backLabel" />
            </Link>
          </div>

          <article
            className="rounded-2xl overflow-hidden border"
            style={{
              borderColor: "var(--color-border-default)",
              backgroundColor: "var(--color-bg-surface)",
            }}
          >
            {news.coverImage && (
              <div className="relative w-full h-64 md:h-96">
                <Image
                  src={news.coverImage.startsWith("/") ? news.coverImage : `/${news.coverImage}`}
                  alt={news.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 896px"
                  unoptimized={news.coverImage === "/news-image.png"}
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              <BlogArticleContent
                type="meta"
                date={news.date}
                locale={locale}
                readTimeMinutes={news.readTimeMinutes}
              />
              <h1
                className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                {news.title}
              </h1>
              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {news.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        border: "1px solid var(--color-border-default)",
                        backgroundColor: "var(--color-bg-page)",
                        color: "var(--color-brand)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {news.content && (
                <MarkdownContent content={news.content} />
              )}
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}
