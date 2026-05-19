import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '加入 OptRouter 代理体系，共享万亿 AI 市场',
  description: '下一代 AI 基础设施，30 秒接入所有 AI 模型，让 AI 像水电一样简单。加入 OptRouter 代理体系，邀请好友即赚佣金，共享万亿市场红利。',
  keywords: [
    'OptRouter 代理', 'AI 代理赚钱', 'AI 推广分佣', 'AI 邀请奖励',
    'OptRouter 招商', 'AI 创业', 'AI 基础设施代理', '推广 AI 工具赚钱',
  ],
  openGraph: {
    title: '加入 OptRouter 代理体系，共享万亿 AI 市场',
    description: '30 秒接入所有 AI 模型，让 AI 像水电一样简单。邀请好友即赚佣金，无上限，共享万亿市场。',
    url: 'https://optrouter.com/promo',
    images: [
      {
        url: '/og-promo.png',
        width: 1200,
        height: 630,
        alt: 'OptRouter 代理招募',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '加入 OptRouter 代理体系，共享万亿 AI 市场',
    description: '30 秒接入所有 AI 模型，让 AI 像水电一样简单。邀请好友即赚佣金，无上限。',
    images: ['/og-promo.png'],
  },
  alternates: {
    canonical: 'https://optrouter.com/promo',
  },
}

export default function PromoLayout({ children }: { children: React.ReactNode }) {
  return children
}
