import { Navbar } from "./(home)/components/navbar"
import { WaterfallReveal } from "./(home)/components/waterfall-reveal"
import { Hero } from "./(home)/components/hero"
import { TodayStatsClassic } from "@/components/today-stats-classic"
import { Stats } from "./(home)/components/stats"
import { Features } from "./(home)/components/features"
import { CodeExample } from "./(home)/components/code-example"
import { Testimonials } from "./(home)/components/testimonials"
import { FAQ } from "./(home)/components/faq"
import { CTA } from "./(home)/components/cta"
import { Footer } from "./(home)/components/footer"

export default function Home() {
  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--color-bg-page)",
      }}
    >
      <Navbar />
      <WaterfallReveal>
        <Hero />
        <Features />
        <TodayStatsClassic />
        <Stats />
        <CodeExample />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </WaterfallReveal>
    </main>
  )
}

