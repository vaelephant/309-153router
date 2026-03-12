import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import SiteAnalytics from '@/components/site-analytics'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL = 'https://optrouter.com'
const SITE_NAME = 'OptRouter'
const DEFAULT_TITLE = 'OptRouter - 下一代 AI 基础设施，30 秒接入所有 AI 模型'
const DEFAULT_DESCRIPTION = '一个 API 接入 OpenAI、Claude、Gemini、DeepSeek 等全球顶尖 AI 模型，智能路由降低 37% 调用成本，自动故障转移，让 AI 像水电一样简单可靠。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'AI API', 'AI 模型', 'OpenAI API', 'Claude API', 'Gemini API', 'DeepSeek API',
    'AI 路由', '智能路由', 'AI 网关', 'LLM API', '大模型 API',
    'AI 代理', 'OptRouter', 'AI 基础设施', 'AI 接入', '统一 AI 接口',
    '降低 AI 成本', 'AI 故障转移', 'OpenAI 兼容',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OptRouter - 下一代 AI 基础设施',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@OptRouter',
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-family-sans), var(--font-family-cn)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SiteAnalytics />
      </body>
    </html>
  )
}
