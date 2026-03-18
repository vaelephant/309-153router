import { Navbar } from "../(home)/components/navbar"
import { Footer } from "@/components/footer"
import { NewsGrid } from "../(home)/components/news-grid"
import { BlogPageTitle } from "./blog-page-title"
import { BlogEmptyState } from "./blog-empty-state"
import { getAllNews } from "@/lib/news"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ locale: string }> }

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const news = await getAllNews()

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
