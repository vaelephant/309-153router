import type { Metadata } from "next"
import { SITE_URL } from "@/lib/seo-home"

const OG_IMAGE = `${SITE_URL}/materials/wechat-moments-poster.png`

export const metadata: Metadata = {
  title: "OptRouter · 一个接口接入多个大模型",
  description: "兼容 OpenAI API，智能路由，自动切换。点击下方按钮了解接入方案。",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/zh/wx-poster`,
    siteName: "OptRouter",
    title: "OptRouter · 一个接口接入多个大模型",
    description: "兼容 OpenAI API · 智能路由 · 自动切换",
    images: [
      {
        url: OG_IMAGE,
        width: 1080,
        height: 1920,
        alt: "OptRouter AI 模型智能网关",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OptRouter · 一个接口接入多个大模型",
    description: "兼容 OpenAI API · 智能路由 · 自动切换",
    images: [OG_IMAGE],
  },
}

export default function WxPosterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
