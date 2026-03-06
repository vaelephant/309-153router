import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Features } from "@/components/features"
import { Models } from "@/components/models"
import { CodeExample } from "@/components/code-example"
import { Pricing } from "@/components/pricing"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main 
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg-page)',
      }}
    >
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Models />
      <CodeExample />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
