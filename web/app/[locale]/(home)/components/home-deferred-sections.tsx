"use client"

import dynamic from "next/dynamic"
import { WaterfallReveal } from "./waterfall-reveal"
import { SectionSkeleton } from "./section-skeleton"

const PainPoints = dynamic(
  () => import("./pain-points").then((m) => ({ default: m.PainPoints })),
  { loading: () => <SectionSkeleton className="h-40" /> }
)
const Features = dynamic(
  () => import("./features").then((m) => ({ default: m.Features })),
  { loading: () => <SectionSkeleton className="h-64" /> }
)
const TodayStatsClassic = dynamic(
  () => import("@/components/today-stats-classic").then((m) => ({ default: m.TodayStatsClassic })),
  { loading: () => <SectionSkeleton className="h-32" /> }
)
const ValueOutcomes = dynamic(
  () => import("./value-outcomes").then((m) => ({ default: m.ValueOutcomes })),
  { loading: () => <SectionSkeleton className="h-48" /> }
)
const Stats = dynamic(
  () => import("./stats").then((m) => ({ default: m.Stats })),
  { loading: () => <SectionSkeleton className="h-40" /> }
)
const ComparisonSection = dynamic(
  () => import("./comparison-section").then((m) => ({ default: m.ComparisonSection })),
  { loading: () => <SectionSkeleton className="h-56" /> }
)
const AudienceSection = dynamic(
  () => import("./audience-section").then((m) => ({ default: m.AudienceSection })),
  { loading: () => <SectionSkeleton className="h-48" /> }
)
const CodeExample = dynamic(
  () => import("./code-example").then((m) => ({ default: m.CodeExample })),
  { loading: () => <SectionSkeleton className="h-72" /> }
)
const EnterpriseSection = dynamic(
  () => import("./enterprise-section").then((m) => ({ default: m.EnterpriseSection })),
  { loading: () => <SectionSkeleton className="h-48" /> }
)
const Testimonials = dynamic(
  () => import("./testimonials").then((m) => ({ default: m.Testimonials })),
  { loading: () => <SectionSkeleton className="h-56" /> }
)
const FAQ = dynamic(
  () => import("./faq").then((m) => ({ default: m.FAQ })),
  { loading: () => <SectionSkeleton className="h-64" /> }
)
const ContactLeadSection = dynamic(
  () => import("./contact-lead-section").then((m) => ({ default: m.ContactLeadSection })),
  { loading: () => <SectionSkeleton className="h-40" /> }
)
const CTA = dynamic(
  () => import("./cta").then((m) => ({ default: m.CTA })),
  { loading: () => <SectionSkeleton className="h-36" /> }
)
const Footer = dynamic(
  () => import("@/components/footer").then((m) => ({ default: m.Footer })),
  { loading: () => <SectionSkeleton className="h-24" /> }
)

export function HomeDeferredSections() {
  return (
    <WaterfallReveal>
      <PainPoints />
      <Features />
      <TodayStatsClassic />
      <ValueOutcomes />
      <Stats />
      <ComparisonSection />
      <AudienceSection />
      <CodeExample />
      <EnterpriseSection />
      <Testimonials />
      <FAQ />
      <ContactLeadSection />
      <CTA />
      <Footer />
    </WaterfallReveal>
  )
}
