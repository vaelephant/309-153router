import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "邀请好友赚奖励 - OptRouter",
  description:
    "邀请好友注册 OptRouter，好友首充后你即获得 ¥20 奖励，无上限。智能 AI 路由，成本降低 37%，完全兼容 OpenAI API。",
  openGraph: {
    title: "邀请好友，一起省钱用 AI — OptRouter",
    description:
      "每邀请一位好友完成首充，你即获得 ¥20 奖励。智能路由自动匹配最优模型，调用成本最高降低 37%。",
    type: "website",
    siteName: "OptRouter",
  },
}

export default function PromoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
