"use client"

import { useState } from "react"
import { Gift, TrendingUp } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const REWARD_PER_INVITE = 20

export function PromoCalculator() {
  const { t } = useI18n()
  const [inviteCount, setInviteCount] = useState(10)

  const totalReward = inviteCount * REWARD_PER_INVITE
  // 预估等值 token（按 ¥1 = 约 50K tokens 估算）
  const estimatedTokens = totalReward * 50

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
          {t("promo.calcTitle")}
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          {t("promo.calcSubtitle")}
        </p>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          }}
        >
          {/* 滑块 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {t("promo.inviteCountLabel")}
              </label>
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--color-brand)" }}
              >
                {inviteCount}{t("promo.peopleSuffix")}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={inviteCount}
              onChange={(e) => setInviteCount(Number(e.target.value))}
              className="promo-slider w-full"
            />
            <div
              className="flex justify-between mt-1 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              <span>{t("promo.people1")}</span>
              <span>{t("promo.people50")}</span>
              <span>{t("promo.people100")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "var(--color-accent-soft)",
                border: "1px solid color-mix(in srgb, var(--color-brand) 15%, transparent)",
              }}
            >
              <Gift className="mx-auto mb-2 h-6 w-6" style={{ color: "var(--color-brand)" }} />
              <div
                className="text-3xl font-bold tabular-nums"
                style={{ color: "var(--color-brand)" }}
              >
                ¥{totalReward.toLocaleString()}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-body)" }}>
                {t("promo.estimatedReward")}
              </p>
            </div>

            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "var(--color-bg-page)",
                border: "1px solid var(--color-border-default)",
              }}
            >
              <TrendingUp
                className="mx-auto mb-2 h-6 w-6"
                style={{ color: "var(--color-brand)" }}
              />
              <div
                className="text-3xl font-bold tabular-nums"
                style={{ color: "var(--color-brand)" }}
              >
                {estimatedTokens >= 1000
                  ? `${(estimatedTokens / 1000).toFixed(0)}M`
                  : `${estimatedTokens}K`}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-body)" }}>
                {t("promo.equivalentTokens")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
