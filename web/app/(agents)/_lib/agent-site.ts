import 'server-only'

import { BLOG_CATEGORY_LABELS } from '@/lib/news/blog-categories'
import { getAllBlogArticles } from '@/lib/news/blog-queries'
import { loadBrandConfig } from '@/lib/load-brand'
import { productCore, siteSeo } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site-url'

export type AgentSiteLink = {
  path: string
  title: string
  description: string
  url: string
}

export type AgentNewsEntry = {
  slug: string
  title: string
  summary: string
  category: string
  publishedAt: string
  url: string
}

export type AgentSiteDocument = {
  generatedAt: string
  brand: {
    name: string
    shortName: string
    tagline: string
  }
  purpose: string
  oneLiner: string
  positioning: string
  pillars: string[]
  capabilities: string[]
  description: string
  keywords: string[]
  targetAudience: string
  contactAction: string
  license: string
  editions: ReturnType<typeof loadBrandConfig>['agents']['editions']
  siteLinks: AgentSiteLink[]
  news: AgentNewsEntry[]
}

function pillarsToList(pillars: string): string[] {
  return pillars
    .split(/\s*\|\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function getAgentSiteDocument(): AgentSiteDocument {
  const brand = loadBrandConfig()
  const articles = getAllBlogArticles()

  const siteLinks: AgentSiteLink[] = brand.agents.siteLinks.map((link) => ({
    ...link,
    url: absoluteUrl(link.path),
  }))

  const news: AgentNewsEntry[] = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: BLOG_CATEGORY_LABELS[article.category],
    publishedAt: article.publishedAt,
    url: absoluteUrl(`/zh/blog/${article.slug}`),
  }))

  return {
    generatedAt: new Date().toISOString(),
    brand: {
      name: brand.brand.name,
      shortName: brand.brand.shortName,
      tagline: brand.brand.ogTagline,
    },
    purpose: brand.agents.purpose,
    oneLiner: brand.agents.oneLiner,
    positioning: productCore.positioning,
    pillars: pillarsToList(productCore.pillars),
    capabilities: [...productCore.capabilities],
    description: siteSeo.description,
    keywords: [...brand.seo.keywords],
    targetAudience: brand.agents.targetAudience,
    contactAction: brand.agents.contactAction,
    license: brand.agents.license,
    editions: brand.agents.editions,
    siteLinks,
    news,
  }
}

export function buildAgentSiteJson(doc: AgentSiteDocument = getAgentSiteDocument()) {
  return {
    ...doc,
    endpoints: {
      json: absoluteUrl('/agents.json'),
      html: absoluteUrl('/agents'),
      llmsTxt: absoluteUrl('/llms.txt'),
    },
  }
}

export function buildLlmsTxt(doc: AgentSiteDocument = getAgentSiteDocument()): string {
  const jsonUrl = absoluteUrl('/agents.json')
  const lines: string[] = [
    `# ${doc.brand.name}`,
    '',
    `JSON: ${jsonUrl}`,
    '',
    `> ${doc.oneLiner}`,
    '',
    '## About',
    doc.description,
    '',
    `- Purpose: ${doc.purpose}`,
    `- Target audience: ${doc.targetAudience}`,
    `- Positioning: ${doc.positioning}`,
    `- Pillars: ${doc.pillars.join(' | ')}`,
    `- Contact: ${doc.contactAction}`,
    '',
    '## Capabilities',
    ...doc.capabilities.map((item) => `- ${item}`),
  ]

  if (doc.editions.length > 0) {
    lines.push(
      '',
      '## Editions',
      ...doc.editions.map(
        (edition) =>
          `- ${edition.name} (${edition.config}) — ${edition.audience}, ${edition.priceRangeCny}`
      )
    )
  }

  lines.push(
    '',
    '## Key Pages',
    ...doc.siteLinks.map((link) => `- [${link.title}](${link.url}): ${link.description}`),
    '',
    '## News & Articles',
    ...doc.news.map(
      (article) =>
        `- [${article.title}](${article.url}) (${article.category}, ${article.publishedAt}): ${article.summary}`
    ),
    '',
    '## Keywords',
    doc.keywords.join(', '),
    '',
    '## License',
    doc.license,
    '',
    `Generated: ${doc.generatedAt}`
  )

  return lines.join('\n')
}

export function agentSiteJsonLd(doc: AgentSiteDocument = getAgentSiteDocument()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: doc.brand.name,
    description: doc.description,
    url: absoluteUrl('/agents'),
    inLanguage: 'zh-CN',
    about: {
      '@type': 'SoftwareApplication',
      name: `${doc.brand.name} API Gateway`,
      applicationCategory: 'DeveloperApplication',
      description: doc.oneLiner,
    },
    hasPart: doc.siteLinks.map((link) => ({
      '@type': 'WebPage',
      name: link.title,
      description: link.description,
      url: link.url,
    })),
    mainEntity: {
      '@type': 'ItemList',
      name: '新闻资讯',
      itemListElement: doc.news.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: article.url,
        name: article.title,
        description: article.summary,
      })),
    },
  }
}
