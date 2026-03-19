import { Navbar } from "../(home)/components/navbar"
import { Footer } from "@/components/footer"
import { NewsGrid } from "../(home)/components/news-grid"
import { BlogPageTitle } from "./blog-page-title"
import { BlogEmptyState } from "./blog-empty-state"
import { BlogTagFilter } from "./blog-tag-filter"
import { getAllNews } from "@/lib/news"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tag?: string }>
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tag } = await searchParams
  const allNews = await getAllNews()
  const news = tag
    ? allNews.filter((item) => item.tags?.includes(tag))
    : allNews

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg-page)" }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <header className="text-center mb-12">
            <h1
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              <BlogPageTitle />
            </h1>
            <BlogTagFilter locale={locale} currentTag={tag} />
            {news.length === 0 ? (
              <BlogEmptyState />
            ) : (
              <NewsGrid news={news} />
            )}
          </header>
        </div>
      </div>
      <Footer />
    </main>
  )
}
