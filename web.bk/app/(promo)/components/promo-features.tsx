"use client"

import { TrendingDown, Zap, Shield, Gift } from "lucide-react"

const FEATURES = [
  {
    icon: TrendingDown,
    title: "成本降低 37%",
    desc: "智能路由自动匹配最优模型与供应商，同等效果更低价格",
  },
  {
    icon: Zap,
    title: "30 秒接入",
    desc: "完全兼容 OpenAI API 格式，改一行代码即可迁移",
  },
  {
    icon: Shield,
    title: "稳定可靠",
    desc: "自动故障转移，多供应商备份，99.9% 可用性保障",
  },
  {
    icon: Gift,
    title: "邀请即赚",
    desc: "每位好友首充后你得 ¥20，无邀请上限，持续收益",
  },
]

export function PromoFeatures() {
  return (
    <section
      className="py-20"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="mb-12 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          为什么选择 OptRouter？
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-6"
              style={{
                border: "1px solid var(--color-border-default)",
                backgroundColor: "var(--color-bg-page)",
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--color-accent-soft)" }}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: "var(--color-brand)" }}
                />
              </div>
              <h3
                className="mb-2 text-base font-semibold"
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
