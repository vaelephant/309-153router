import type { Metadata } from 'next'
import { Navbar } from './(home)/components/navbar'
import { WaterfallReveal } from './(home)/components/waterfall-reveal'
import { Hero } from './(home)/components/hero'
import { TodayStatsClassic } from '@/components/today-stats-classic'
import { Stats } from './(home)/components/stats'
import { Features } from './(home)/components/features'
import { CodeExample } from './(home)/components/code-example'
import { Testimonials } from './(home)/components/testimonials'
import { FAQ } from './(home)/components/faq'
import { CTA } from './(home)/components/cta'
import { Footer } from '@/components/footer'
import zhMessages from '@/messages/zh.json'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'

type Props = { params: Promise<{ locale: string }> }

const HOME_META: Record<string, { title: string; description: string }> = {
  zh: (zhMessages as { home: { title: string; description: string } }).home,
  en: (enMessages as { home: { title: string; description: string } }).home,
  ja: (jaMessages as { home: { title: string; description: string } }).home,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const home = HOME_META[locale]
  return {
    title: home?.title ?? 'OptRouter',
    description: home?.description ?? '',
    alternates: { canonical: 'https://optrouter.com' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://optrouter.com/#organization',
      name: 'OptRouter',
      url: 'https://optrouter.com',
      logo: { '@type': 'ImageObject', url: 'https://optrouter.com/icon.svg' },
      description: '下一代 AI 基础设施，提供统一 AI 模型接口、智能路由和成本优化。',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://optrouter.com/#website',
      url: 'https://optrouter.com',
      name: 'OptRouter',
      publisher: { '@id': 'https://optrouter.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://optrouter.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'OptRouter API',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      url: 'https://optrouter.com',
      description: '统一 AI 模型 API 网关，支持 OpenAI、Claude、Gemini、DeepSeek 等，智能路由降低成本，自动故障转移保障稳定。',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY', description: '免费注册，按量付费' },
      featureList: ['一个 API 接入所有主流 AI 模型', '智能路由降低 37% 调用成本', '自动故障转移', '统一账单管理', '兼容 OpenAI SDK'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'OptRouter 支持哪些 AI 模型？', acceptedAnswer: { '@type': 'Answer', text: 'OptRouter 支持 OpenAI GPT 系列、Anthropic Claude、Google Gemini、DeepSeek、Meta Llama 等全球主流大语言模型，并持续更新。' } },
        { '@type': 'Question', name: '使用 OptRouter 能节省多少成本？', acceptedAnswer: { '@type': 'Answer', text: '通过智能路由自动选择性价比最优的模型和供应商，平均可降低 37% 的 AI 调用成本。' } },
        { '@type': 'Question', name: 'OptRouter 是否兼容 OpenAI SDK？', acceptedAnswer: { '@type': 'Answer', text: '是的，OptRouter 完全兼容 OpenAI API 格式，只需替换 base_url 即可无缝迁移，无需修改任何业务代码。' } },
        { '@type': 'Question', name: '如何快速开始使用 OptRouter？', acceptedAnswer: { '@type': 'Answer', text: '注册账号后获取 API Key，将 base_url 替换为 https://api.optrouter.com/v1 即可，全程不超过 30 秒。' } },
      ],
    },
  ],
}

export default function HomePage({ params }: Props) {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <WaterfallReveal>
        <Hero />
        <Features />
        <TodayStatsClassic />
        <Stats />
        <CodeExample />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </WaterfallReveal>
    </main>
  )
}
