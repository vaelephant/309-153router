"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PromoNavbar } from "../components/promo-navbar"
import { PromoHero } from "../components/promo-hero"
import { PromoFeatures } from "../components/promo-features"
import { PromoCalculator } from "../components/promo-calculator"
import { PromoComparison } from "../components/promo-comparison"
import { PromoSteps } from "../components/promo-steps"
import { PromoShare } from "../components/promo-share"
import { PromoRules } from "../components/promo-rules"
import { PromoFaq } from "../components/promo-faq"
import { PromoCta } from "../components/promo-cta"
import { Footer } from "@/components/footer"

function PromoContent() {
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("code") || ""

  const registerHref = inviteCode
    ? `/register?invite_code=${encodeURIComponent(inviteCode)}`
    : "/register"

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg-page)" }}
    >
      <PromoNavbar registerHref={registerHref} />
      <PromoHero registerHref={registerHref} inviteCode={inviteCode} />
      <PromoFeatures />
      <PromoCalculator />
      <PromoComparison />
      <PromoSteps />
      <PromoShare registerHref={registerHref} inviteCode={inviteCode} />
      <PromoRules />
      <PromoFaq />
      <PromoCta registerHref={registerHref} />
      <Footer />
    </div>
  )
}

export default function PromoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--color-brand)" />
        </div>
      }
    >
      <PromoContent />
    </Suspense>
  )
}
