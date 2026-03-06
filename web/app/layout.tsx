import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OptRouter - \u7edf\u4e00 AI \u6a21\u578b API \u7f51\u5173',
  description: '\u901a\u8fc7\u4e00\u4e2a\u63a5\u53e3\u8c03\u7528\u591a\u5bb6 AI \u6a21\u578b\uff0c\u7b80\u5316\u4f60\u7684 AI \u5f00\u53d1\u5de5\u4f5c\u6d41',
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
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
