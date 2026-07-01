/**
 * CLI: 生成新闻资讯 Markdown，写入 content/news/YYYY-MM-DD-slug.md
 *
 * 用法:
 *   npm run news:generate -- --topic "多模型路由中的 Fallback 策略"
 *   npm run news:generate -- --auto
 *
 * 环境变量 (.env / .env.local):
 *   OPENAI_API_KEY
 *   OPENAI_BASE_URL   (可选)
 *   HTTP_PROXY / HTTPS_PROXY  (可选，FlClash 等本地代理，如 http://127.0.0.1:7890)
 *   UNSPLASH_ACCESS_KEY (可选)
 *   DINGTALK_NEWS_ENABLED / DINGTALK_NEWS_WEBHOOK_URL / DINGTALK_NEWS_SECRET (可选，生成成功后播报)
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import matter from 'gray-matter'
import OpenAI from 'openai'
import { ProxyAgent, fetch as undiciFetch } from 'undici'
import { z } from 'zod'

import type { BlogArticle, BlogCategory } from '../lib/news/article-types'
import { BRAND, BRAND_KEYWORDS, FALLBACK_TOPICS } from '../lib/news/brand'
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_UNSPLASH_QUERIES,
} from '../lib/news/blog-categories'
import { pickIndexFromSeed, searchUnsplashCover } from '../lib/news/unsplash'
import { isNewsDingTalkConfigured, notifyNewsPublished } from '../lib/news/dingtalk'

function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const path = join(process.cwd(), name)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      if (process.env[key] !== undefined) continue
      let val = trimmed.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
}

loadEnvFiles()

interface CliArgs {
  topic?: string
  category?: BlogCategory
  model: string
  discoveryModel: string
  auto: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const args: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i++
    }
  }

  const topic = typeof args.topic === 'string' ? args.topic : undefined
  const auto = args.auto === true
  if (!topic && !auto) {
    console.error(
      '\nUsage:\n' +
        '  npm run news:generate -- --topic <topic> [--category <slug>]\n' +
        '  npm run news:generate -- --auto\n' +
        '\nCategories: ' +
        BLOG_CATEGORIES.join(', ') +
        '\n'
    )
    process.exit(1)
  }

  const category =
    typeof args.category === 'string' ? args.category : undefined
  if (category && !(BLOG_CATEGORIES as string[]).includes(category)) {
    console.error(
      `Invalid --category "${category}". Choose one of: ${BLOG_CATEGORIES.join(', ')}`
    )
    process.exit(1)
  }

  return {
    topic,
    category: category as BlogCategory | undefined,
    model:
      (typeof args.model === 'string' ? args.model : undefined) ||
      process.env.OPENAI_MODEL ||
      'gpt-4o-mini',
    discoveryModel:
      (typeof args['discovery-model'] === 'string'
        ? (args['discovery-model'] as string)
        : undefined) ||
      process.env.OPENAI_DISCOVERY_MODEL ||
      'gpt-4o',
    auto,
    dryRun: args['dry-run'] === true,
  }
}

const CONTENT_DIR = resolve(process.cwd(), 'content/news')

function resolveProxyUrl(): string | undefined {
  return process.env.HTTPS_PROXY || process.env.HTTP_PROXY || undefined
}

/** OpenAI SDK 不走 NODE_USE_ENV_PROXY，需显式注入带代理的 fetch */
function createProxyFetch(proxyUrl: string): typeof fetch {
  const dispatcher = new ProxyAgent(proxyUrl)
  return ((input: RequestInfo | URL, init?: RequestInit) =>
    undiciFetch(input as string | URL, {
      ...(init ?? {}),
      dispatcher,
    } as Parameters<typeof undiciFetch>[1])) as typeof fetch
}

function openaiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env and re-run.')
  }
  const proxyUrl = resolveProxyUrl()
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    ...(proxyUrl ? { fetch: createProxyFetch(proxyUrl) } : {}),
  })
}

const DiscoverySchema = z.object({
  topic: z.string().min(6).max(80),
  category: z.enum(BLOG_CATEGORIES as [BlogCategory, ...BlogCategory[]]),
  angle: z.string().min(20).max(300),
  sources: z.array(z.string().url()).max(6).default([]),
})

async function discoverTopic(args: CliArgs): Promise<{
  topic: string
  category: BlogCategory
  angle: string
  sources: string[]
}> {
  const openai = openaiClient()
  const prompt = `你是 ${BRAND.name} 的资讯编辑。用你的联网搜索能力，找出**过去 14 天内**与 AI API 网关、多模型路由相关的、值得写一篇深度文章的**一个**热点选题。

品牌定位：${BRAND.positioning}
目标读者：${BRAND.audience}
关键词方向：${BRAND_KEYWORDS.join('、')}

要求：
- 优先近期发布（HackerNews、GitHub trending、OpenAI/Anthropic 博客、机器之心、量子位等）
- 选题必须能承载 800+ 字的中文深度文章
- 与统一 API 网关、模型路由、成本优化有明确关联

只返回严格 JSON（不要 Markdown 包裹）：
{
  "topic": "8-40 字的中文选题",
  "category": "guide/deep-dive/compare/routing/product 之一",
  "angle": "50-200 字，说明核心观点",
  "sources": ["1-6 个 URL"]
}`

  console.log(`→ Discovering topic (${args.discoveryModel}, web_search)...`)

  const response = await openai.responses.create({
    model: args.discoveryModel,
    tools: [{ type: 'web_search_preview' }],
    input: prompt,
  })

  const raw = response.output_text?.trim()
  if (!raw) throw new Error('Discovery returned empty output')
  const jsonBody = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonBody)
  } catch {
    throw new Error(`Discovery returned non-JSON:\n${raw.slice(0, 400)}`)
  }
  const result = DiscoverySchema.safeParse(parsed)
  if (!result.success) {
    console.error('Discovery schema validation failed:')
    console.error(JSON.stringify(result.error.issues, null, 2))
    throw new Error('Discovered topic did not match schema')
  }
  return result.data
}

const ArticleSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .min(8)
    .max(80),
  title: z.string().min(8).max(80),
  summary: z.string().min(60).max(220),
  content: z.string().min(500),
  category: z.enum(BLOG_CATEGORIES as [BlogCategory, ...BlogCategory[]]),
  tags: z.array(z.string()).min(2).max(6),
  faqs: z
    .array(
      z.object({
        question: z.string().min(6).max(80),
        answer: z.string().min(20).max(400),
      })
    )
    .min(2)
    .max(4),
})

const SYSTEM_PROMPT = `你是 ${BRAND.name} 的资讯编辑，负责撰写面向 ${BRAND.audience} 的中文长文。

品牌定位：${BRAND.positioning}

风格要求：
- 语气克制、专业、有观点，避免营销词汇
- 用具体数字、场景、技术细节支撑论述
- 中文标点，不用直双引号
- 正文从二级标题(##)开始，不要 h1
- 目标读者已懂技术，直接进入洞察

返回严格 JSON（不要 Markdown 包裹）：
{
  "slug": "英文 kebab-case，8-80 字符",
  "title": "中文标题，8-40 字",
  "summary": "80-200 字摘要",
  "content": "500+ 字 Markdown 正文，从 ## 开始",
  "category": "guide/deep-dive/compare/routing/product 之一",
  "tags": ["3-5 个中文标签"],
  "faqs": [{"question": "...", "answer": "..."}, ...]
}`

function buildUserPrompt(
  topic: string,
  category: BlogCategory | undefined,
  angle: string | undefined
): string {
  const parts: string[] = [`选题：${topic}`]
  if (angle) parts.push(`编辑视角：${angle}`)
  if (category) {
    parts.push(
      `分类固定为：${category}（${BLOG_CATEGORY_LABELS[category]}）`
    )
  } else {
    parts.push('请自行选择最贴合的 category')
  }
  parts.push('slug 用英文短横线；title 中文；正文不含 h1。')
  return parts.join('\n\n')
}

async function generateArticle(
  args: CliArgs,
  topic: string,
  category: BlogCategory | undefined,
  angle: string | undefined
): Promise<z.infer<typeof ArticleSchema>> {
  const openai = openaiClient()
  console.log(`→ Writing article (${args.model})...`)
  const completion = await openai.chat.completions.create({
    model: args.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(topic, category, angle) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })
  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned empty content')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`OpenAI returned non-JSON:\n${raw.slice(0, 400)}`)
  }
  const result = ArticleSchema.safeParse(parsed)
  if (!result.success) {
    console.error('Article schema validation failed:')
    console.error(JSON.stringify(result.error.issues, null, 2))
    throw new Error('Generated article did not match schema')
  }
  return result.data
}

function existingSlugs(): Set<string> {
  const slugs = new Set<string>()
  try {
    for (const f of readdirSync(CONTENT_DIR).filter((x) => x.endsWith('.md'))) {
      const m = f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/)
      if (m) slugs.add(m[1])
    }
  } catch {
    /* empty */
  }
  return slugs
}

function ensureUniqueSlug(baseSlug: string, existing: Set<string>): string {
  if (!existing.has(baseSlug)) return baseSlug
  for (let i = 2; i <= 20; i++) {
    const cand = `${baseSlug}-${i}`
    if (!existing.has(cand)) return cand
  }
  return `${baseSlug}-${Date.now()}`
}

function estimateReadingMinutes(content: string): number {
  const chars = content.replace(/\s+/g, '').length
  return Math.max(3, Math.round(chars / 400))
}

type ArticleFrontmatter = Omit<BlogArticle, 'content' | 'source'>

function toMarkdownFile(article: ArticleFrontmatter & { content: string }): string {
  const { content, ...frontmatter } = article
  return matter.stringify(`\n${content}\n`, frontmatter)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  console.log(`\n=== ${BRAND.name} · 生成新闻资讯 ===`)
  console.log(`Mode:      ${args.auto ? 'auto (discovery)' : 'manual'}`)
  console.log(`Article:   ${args.model}`)
  if (args.auto) console.log(`Discovery: ${args.discoveryModel}`)
  console.log(`Dry run:   ${args.dryRun}`)
  const proxyUrl = resolveProxyUrl()
  if (proxyUrl) console.log(`Proxy:     ${proxyUrl}`)
  console.log()

  let topic = args.topic
  let angle: string | undefined
  let category = args.category
  let sources: string[] = []

  if (args.auto && !topic) {
    try {
      const discovered = await discoverTopic(args)
      topic = discovered.topic
      angle = discovered.angle
      category = category ?? discovered.category
      sources = discovered.sources
      console.log(`  Discovered topic:    ${topic}`)
      console.log(`  Discovered category: ${discovered.category}`)
      console.log(
        `  Sources:             ${sources.length ? sources.join(', ') : '(none)'}`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`  ⚠ Discovery failed (${msg}) — falling back to topic pool.`)
      const day = new Date().getDate()
      const pick = FALLBACK_TOPICS[day % FALLBACK_TOPICS.length]
      topic = pick.topic
      category = category ?? pick.category
      console.log(`  Fallback topic:    ${topic}`)
      console.log(`  Fallback category: ${category}`)
    }
  }

  if (!topic) {
    console.error('No topic. Exiting.')
    process.exit(1)
  }

  const raw = await generateArticle(args, topic, category, angle)
  const existing = existingSlugs()
  const slug = ensureUniqueSlug(raw.slug, existing)
  const today = new Date().toISOString().slice(0, 10)

  console.log(`\n→ Fetching Unsplash cover (category "${raw.category}")...`)
  const cover = await searchUnsplashCover({
    query: BLOG_CATEGORY_UNSPLASH_QUERIES[raw.category],
    orientation: 'landscape',
    perPage: 10,
    pick: pickIndexFromSeed(slug, 10),
  }).catch((err) => {
    console.warn(
      `  ⚠ Unsplash failed (${err instanceof Error ? err.message : err}). Skipping cover.`
    )
    return null
  })

  const article: ArticleFrontmatter & { content: string } = {
    slug,
    title: raw.title,
    summary: raw.summary,
    content: raw.content,
    category: raw.category,
    tags: raw.tags,
    publishedAt: today,
    updatedAt: today,
    readingMinutes: estimateReadingMinutes(raw.content),
    faqs: raw.faqs,
    ...(cover ? { cover } : {}),
  }

  const filename = `${today}-${slug}.md`
  const filepath = join(CONTENT_DIR, filename)

  console.log(`\n=== Result ===`)
  console.log(`File:      ${filename}`)
  console.log(`Title:     ${article.title}`)
  console.log(`Category:  ${article.category}`)
  console.log(`Tags:      ${article.tags.join(', ')}`)
  console.log(`Reading:   ${article.readingMinutes} min`)
  console.log(
    `Cover:     ${cover ? `Unsplash — ${cover.photographer}` : '(none)'}`
  )

  if (args.dryRun) {
    console.log('\n(dry-run) skipping write.\n')
    return
  }

  writeFileSync(filepath, toMarkdownFile(article), 'utf8')
  console.log(`\n✓ Wrote content/news/${filename}`)
  console.log(`✓ Preview at: /zh/blog/${slug}`)

  const dingOk = await notifyNewsPublished({
    title: article.title,
    slug: article.slug,
    category: article.category,
    tags: article.tags,
    publishedAt: article.publishedAt,
  })
  if (dingOk) {
    console.log('✓ DingTalk notification sent')
  } else if (isNewsDingTalkConfigured()) {
    console.warn('⚠ DingTalk notification failed')
  }
  console.log()
}

main().catch((err) => {
  console.error('\n✗ Generation failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
