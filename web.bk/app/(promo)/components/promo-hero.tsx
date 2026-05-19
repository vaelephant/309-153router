"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, CheckCircle2, Users, Coins, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

interface PromoHeroProps {
  registerHref: string
  inviteCode: string
}

/** 数字滚动动画 hook */
function useCountUp(target: number, duration: number = 1500) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

const STATS = [
  { icon: Users, label: "注册用户", value: 2860, suffix: "+" },
  { icon: TrendingDown, label: "平均节省", value: 37, suffix: "%" },
  { icon: Coins, label: "已发放奖励", value: 12400, prefix: "¥" },
]

export function PromoHero({ registerHref, inviteCode }: PromoHeroProps) {
  const counts = STATS.map((s) => useCountUp(s.value, 2000))

  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      {/* 动画渐变背景 */}
      <div className="promo-hero-bg absolute inset-0 -z-10 pointer-events-none" />

      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* 标签 */}
        <span
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: "var(--color-accent-soft)",
            color: "var(--color-brand)",
            border: "1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)",
          }}
        >
          <Gift className="h-3 w-3" />
          限时推广活动进行中
        </span>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
            marginBottom: "16px",
            whiteSpace: "nowrap",
          }}
        >
          下一代 AI 基础设施，从 OptRouter 开始
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            lineHeight: 1.6,
            color: "var(--color-text-body)",
            maxWidth: "560px",
            margin: "0 auto 32px",
          }}
        >
          30 秒接入所有 AI 模型，让 AI 像水电一样简单，加入 OptRouter 代理体系，共享万亿市场。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={registerHref}>
            <Button className="ds-btn-primary h-11 px-6 text-sm">
              <Gift className="mr-2 h-4 w-4" />
              立即注册领取邀请码
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="h-11 px-6 text-sm"
              style={{
                borderColor: "var(--color-border-default)",
                color: "var(--color-text-body)",
              }}
            >
              了解 OptRouter
            </Button>
          </Link>
        </div>

        {inviteCode && (
          <p
            className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{
              background: "var(--color-accent-soft)",
              color: "var(--color-brand)",
              fontWeight: 500,
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            你的好友邀请码：
            <span style={{ fontWeight: 700 }}>{inviteCode}</span>
            ，注册时自动填入
          </p>
        )}

        {/* 数据统计条 */}
        <div
          className="mt-14 mx-auto grid max-w-md grid-cols-3 gap-4 rounded-2xl px-6 py-5"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--color-brand)" }}
              >
                {stat.prefix || ""}
                {counts[i].toLocaleString()}
                {stat.suffix || ""}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
