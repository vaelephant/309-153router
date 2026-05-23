"use client"

import { Suspense } from "react"
import { AiGatewayHeader } from "../components/ai-gateway-header"
import { AiGatewayHero } from "../components/ai-gateway-hero"
import { AiGatewayPain } from "../components/ai-gateway-pain"
import { AiGatewaySolutions } from "../components/ai-gateway-solutions"
import { AiGatewaySteps } from "../components/ai-gateway-steps"
import { AiGatewayAudience } from "../components/ai-gateway-audience"
import { AiGatewayConvert } from "../components/ai-gateway-convert"
import { AiGatewayStickyCta } from "../components/ai-gateway-sticky-cta"

function AiGatewayPageContent() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg-page)" }}>
      <AiGatewayHeader />
      <AiGatewayHero />
      <AiGatewayPain />
      <AiGatewaySolutions />
      <AiGatewaySteps />
      <AiGatewayAudience />
      <AiGatewayConvert />
      <AiGatewayStickyCta />
    </main>
  )
}

export default function AiGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-(--color-brand)" />
        </div>
      }
    >
      <AiGatewayPageContent />
    </Suspense>
  )
}
