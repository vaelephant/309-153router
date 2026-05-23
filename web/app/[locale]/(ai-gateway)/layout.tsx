import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '一个接口，稳定接入多个大模型 | OptRouter',
  description:
    '兼容 OpenAI API，统一调用多个大模型。扫码加微信获取方案，或免费试用。',
  keywords: [
    'OptRouter',
    'AI 网关',
    '大模型路由',
    'OpenAI 兼容',
    '智能路由',
    '模型聚合',
    'AI API',
  ],
  openGraph: {
    title: 'OptRouter：下一代 AI 模型智能网关',
    description:
      '统一接入主流大模型，智能路由优化成本、速度与稳定性。立即试用或预约演示。',
    url: 'https://optrouter.com/zh/ai-gateway',
    type: 'website',
    siteName: 'OptRouter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OptRouter AI Gateway',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptRouter：下一代 AI 模型智能网关',
    description: '统一接入主流大模型，智能路由优化成本、速度与稳定性。',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://optrouter.com/zh/ai-gateway',
  },
}

export default function AiGatewayLayout({ children }: { children: React.ReactNode }) {
  return children
}
