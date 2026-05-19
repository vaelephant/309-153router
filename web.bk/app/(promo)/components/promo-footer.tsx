"use client"

import Link from "next/link"

interface PromoFooterProps {
  registerHref: string
}

export function PromoFooter({ registerHref }: PromoFooterProps) {
  return (
    <footer
      className="border-t py-8"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          © {new Date().getFullYear()} OptRouter. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href="/"
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            首页
          </Link>
          <Link
            href="/login"
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            登录
          </Link>
          <Link
            href={registerHref}
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            注册
          </Link>
        </div>
      </div>
    </footer>
  )
}
