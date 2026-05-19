"use client"

import { UserPlus, Share2, Wallet } from "lucide-react"

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "注册账号",
    desc: "免费注册 OptRouter 账号，立即获取专属邀请码",
  },
  {
    step: "02",
    icon: Share2,
    title: "分享给好友",
    desc: "将邀请链接发送到微信好友、朋友圈或任何社交平台",
  },
  {
    step: "03",
    icon: Wallet,
    title: "好友充值你得奖励",
    desc: "好友通过你的链接注册并完成首充，你即获得 ¥20 奖励",
  },
]

export function PromoSteps() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="mb-4 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          三步开始赚奖励
        </h2>
        <p
          className="mb-12 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          简单三步，轻松赚取邀请奖励
        </p>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "var(--color-brand)",
                  color: "#fff",
                }}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <span
                className="mb-2 block text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--color-text-muted)" }}
              >
                Step {item.step}
              </span>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-body)" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
