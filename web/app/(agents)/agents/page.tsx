import type { Metadata } from 'next'
import Link from 'next/link'

import {
  agentSiteJsonLd,
  getAgentSiteDocument,
} from '@/app/(agents)/_lib/agent-site'
import JsonLd from '@/components/seo/JsonLd'
import { buildMetadata, siteSeo } from '@/lib/seo'

export const metadata: Metadata = {
  ...buildMetadata({
    title: `Agent 首页 · ${siteSeo.shortName}`,
    description:
      'OptRouter 站点结构化摘要：产品定位、能力、关键页面与新闻资讯索引，供 AI Agent 与 LLM 快速理解。',
    path: '/agents',
  }),
  alternates: {
    types: {
      'application/json': '/agents.json',
      'text/plain': '/llms.txt',
    },
  },
}

export default function AgentsHomePage() {
  const doc = getAgentSiteDocument()

  return (
    <>
      <JsonLd data={agentSiteJsonLd(doc)} />

      <article className="mx-auto max-w-4xl px-4 py-12 font-mono text-sm leading-relaxed sm:px-6 sm:py-16">
        <header className="mb-10 space-y-4 border-b border-slate-200 pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Agent-readable site index
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {doc.brand.name} — Agent 首页
          </h1>
          <p className="text-base text-slate-600">{doc.oneLiner}</p>
          <p className="text-xs text-slate-500">{doc.purpose}</p>
          <p className="text-xs text-slate-500">
            JSON：
            <Link href="/agents.json" className="ml-1 text-indigo-600 hover:underline">
              /agents.json
            </Link>
            {' · '}
            纯文本：
            <Link href="/llms.txt" className="ml-1 text-indigo-600 hover:underline">
              /llms.txt
            </Link>
            {' · '}
            人类首页：
            <Link href="/zh" className="ml-1 text-indigo-600 hover:underline">
              /zh
            </Link>
          </p>
        </header>

        <section id="about" className="mb-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">About</h2>
          <p>{doc.description}</p>
          <dl className="grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">Positioning</dt>
              <dd>{doc.positioning}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Target audience</dt>
              <dd>{doc.targetAudience}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Contact</dt>
              <dd>{doc.contactAction}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Generated</dt>
              <dd>{doc.generatedAt}</dd>
            </div>
          </dl>
        </section>

        <section id="pillars" className="mb-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Pillars</h2>
          <ul className="list-disc space-y-1 pl-5">
            {doc.pillars.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </section>

        <section id="capabilities" className="mb-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Capabilities</h2>
          <ul className="list-disc space-y-1 pl-5">
            {doc.capabilities.map((cap) => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
        </section>

        {doc.editions.length > 0 && (
          <section id="editions" className="mb-10 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Editions</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Config</th>
                    <th className="py-2 pr-4 font-semibold">Audience</th>
                    <th className="py-2 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.editions.map((edition) => (
                    <tr key={edition.name} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{edition.name}</td>
                      <td className="py-2 pr-4">{edition.config}</td>
                      <td className="py-2 pr-4">{edition.audience}</td>
                      <td className="py-2">{edition.priceRangeCny}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section id="pages" className="mb-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Key Pages</h2>
          <ul className="space-y-3">
            {doc.siteLinks.map((link) => (
              <li key={link.path}>
                <Link href={link.path} className="font-semibold text-indigo-600 hover:underline">
                  {link.title}
                </Link>
                <span className="ml-2 text-slate-400">{link.path}</span>
                <p className="mt-1 text-slate-600">{link.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="news" className="mb-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">News & Articles</h2>
          <ul className="space-y-4">
            {doc.news.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/zh/blog/${article.slug}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {article.title}
                </Link>
                <p className="mt-1 text-xs text-slate-400">
                  {article.category} · {article.publishedAt}
                </p>
                <p className="mt-1 text-slate-600">{article.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="keywords" className="mb-10 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Keywords</h2>
          <p className="text-xs text-slate-600">{doc.keywords.join(', ')}</p>
        </section>

        <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>{doc.license}</p>
        </footer>
      </article>
    </>
  )
}
