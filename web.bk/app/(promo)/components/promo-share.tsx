"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, MessageCircle, Share2 } from "lucide-react"

interface PromoShareProps {
  registerHref: string
  inviteCode: string
}

export function PromoShare({ registerHref, inviteCode }: PromoShareProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${registerHref}`
      : registerHref

  const shareText = `🚀 推荐一个超划算的 AI API 平台 — OptRouter

✅ 完全兼容 OpenAI API，30秒接入
✅ 智能路由，调用成本降低37%
✅ 注册即可使用，充值还能给我赚 ¥20 奖励

👉 注册链接：${shareUrl}
${inviteCode ? `📎 邀请码：${inviteCode}` : ""}`

  const wechatText = `推荐一个超划算的AI API平台 OptRouter，完全兼容OpenAI API，智能路由省37%成本。注册链接：${shareUrl}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText(wechatText)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      // ignore
    }
  }

  // 如果没有邀请码（未登录用户），不显示分享工具栏
  if (!inviteCode) return null

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
          一键分享给好友
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          选择适合你的分享方式，复制后直接发送
        </p>

        <div className="space-y-4">
          {/* 邀请链接 */}
          <div
            className="flex items-center gap-3 rounded-xl p-4"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-default)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                邀请链接
              </p>
              <p
                className="text-sm truncate"
                style={{ color: "var(--color-text-body)" }}
              >
                {shareUrl}
              </p>
            </div>
            <Button
              size="sm"
              className="ds-btn-primary shrink-0 px-4 text-xs"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <Check className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" />
              )}
              {copiedLink ? "已复制" : "复制链接"}
            </Button>
          </div>

          {/* 分享按钮行 */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCopyWechat}
              className="flex items-center justify-center gap-2 rounded-xl p-4 text-sm font-medium transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: "#07C160",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              <MessageCircle className="h-4 w-4" />
              复制微信分享文案
            </button>

            <button
              onClick={handleCopyShareText}
              className="flex items-center justify-center gap-2 rounded-xl p-4 text-sm font-medium transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--color-brand)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Share2 className="h-4 w-4" />
              {copiedText ? "已复制 ✓" : "复制朋友圈文案"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
