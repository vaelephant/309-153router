"use client"

import { CheckCircle2 } from "lucide-react"

const RULES = [
  "每成功邀请一位好友注册并完成首次充值，邀请人获得 ¥20 余额奖励",
  "邀请人数无上限，奖励无上限",
  "奖励实时到账，可直接用于 API 调用",
  "被邀请人需通过你的专属邀请链接或邀请码注册",
  "每位被邀请人仅限首次充值触发奖励，不可重复领取",
]

export function PromoRules() {
  return (
    <section
      className="py-20"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="mb-8 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          奖励规则
        </h2>

        <div
          className="rounded-xl p-6 sm:p-8"
          style={{
            border: "1px solid var(--color-border-default)",
            backgroundColor: "var(--color-bg-page)",
          }}
        >
          <ul className="space-y-4">
            {RULES.map((rule, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed"
                style={{ color: "var(--color-text-body)" }}
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "var(--color-brand)" }}
                />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
