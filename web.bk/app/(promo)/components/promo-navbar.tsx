"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface PromoNavbarProps {
  registerHref: string
}

export function PromoNavbar({ registerHref }: PromoNavbarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        borderColor: "var(--color-border-default)",
        backgroundColor: "var(--color-bg-page)",
        backdropFilter: "blur(12px)",
      }}
    >
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          style={{
            color: "var(--color-text-primary)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background: "var(--color-button-primary-bg)",
              color: "var(--color-button-primary-text)",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700 }}>O</span>
          </div>
          <span>OptRouter</span>
        </Link>

        <Link href={registerHref}>
          <Button size="sm" className="ds-btn-primary px-4 py-2 text-xs">
            立即注册
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>
    </header>
  )
}
