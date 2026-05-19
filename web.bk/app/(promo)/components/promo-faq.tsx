"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQ_ITEMS = [
  {
    q: "邀请奖励多久到账？",
    a: "被邀请人完成首次充值后，¥20 奖励将实时到账至你的余额，无需等待审核。",
  },
  {
    q: "邀请人数有上限吗？",
    a: "没有上限！你可以邀请任意数量的好友，每位好友首充后你都能获得 ¥20 奖励。",
  },
  {
    q: "奖励可以提现吗？",
    a: "奖励以余额形式发放，可直接用于 API 调用扣费，暂不支持提现。",
  },
  {
    q: "好友需要充值多少才能触发奖励？",
    a: "好友完成任意金额的首次充值即可触发，没有最低充值金额限制。",
  },
  {
    q: "我可以在哪里查看邀请记录和奖励？",
    a: "登录后进入「邀请好友」页面，可以查看邀请用户总数、奖励总数和详细的邀请记录。",
  },
  {
    q: "OptRouter 兼容哪些 API 格式？",
    a: "完全兼容 OpenAI API 格式，支持 OpenAI SDK、Ollama SDK、LangChain 等主流框架，改一行 baseURL 即可迁移。",
  },
]

export function PromoFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-6">
        <h2
          className="mb-4 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          常见问题
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          关于邀请奖励的常见疑问
        </p>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  border: "1px solid var(--color-border-default)",
                  backgroundColor: isOpen
                    ? "var(--color-bg-surface)"
                    : "var(--color-bg-page)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="text-sm font-medium pr-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform"
                    style={{
                      color: "var(--color-text-muted)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="px-5 pb-4 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
