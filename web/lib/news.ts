import fs from "fs"
import path from "path"
import matter from "gray-matter"

const newsDirectory = path.join(process.cwd(), "content/news")

export interface NewsItem {
  slug: string
  title: string
  date: string
  coverImage: string
  excerpt: string
  content: string
  /** 分类/标签，用于卡片底部展示 */
  tags?: string[]
  /** 阅读时长（分钟），可选，不填则根据 content 长度估算 */
  readTimeMinutes?: number
}

function ensureNewsDir() {
  if (!fs.existsSync(newsDirectory)) {
    fs.mkdirSync(newsDirectory, { recursive: true })
  }
}

export async function getAllNews(): Promise<NewsItem[]> {
  ensureNewsDir()
  const fileNames = fs.readdirSync(newsDirectory)
  const allNews = fileNames
    .filter((fileName) => fileName.endsWith(".md") && fileName !== "README.md")
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const fullPath = path.join(newsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)
      const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
      let readTimeMinutes = data.readTimeMinutes
      if (readTimeMinutes == null && content) {
        const wordCount = content.replace(/\s/g, "").length
        readTimeMinutes = Math.max(1, Math.ceil(wordCount / 400))
      }
      return {
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        coverImage: data.coverImage ?? "/icon.svg",
        excerpt: data.excerpt ?? "",
        content,
        tags: tags.length ? tags : undefined,
        readTimeMinutes,
      }
    })
  return allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  try {
    ensureNewsDir()
    const fullPath = path.join(newsDirectory, `${slug}.md`)
    if (!fs.existsSync(fullPath)) return null
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)
    const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
    let readTimeMinutes = data.readTimeMinutes
    if (readTimeMinutes == null && content) {
      const wordCount = content.replace(/\s/g, "").length
      readTimeMinutes = Math.max(1, Math.ceil(wordCount / 400))
    }
    return {
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      coverImage: data.coverImage ?? "/icon.svg",
      excerpt: data.excerpt ?? "",
      content,
      tags: tags.length ? tags : undefined,
      readTimeMinutes,
    }
  } catch {
    return null
  }
}
