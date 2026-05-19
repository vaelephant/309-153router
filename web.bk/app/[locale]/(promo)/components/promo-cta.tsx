"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gift, ArrowRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useI18n } from "@/lib/i18n-context"

interface PromoCtaProps {
  registerHref: string
}

export function PromoCta({ registerHref }: PromoCtaProps) {
  const { t } = useI18n()
  const typewriterText = t("promo.ctaTypewriter")
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return

    let timeout: ReturnType<typeof setTimeout>

    const startTyping = () => {
      indexRef.current = 0
      setDisplayed("")
      setDone(false)
      const interval = setInterval(() => {
        indexRef.current += 1
        setDisplayed(typewriterText.slice(0, indexRef.current))
        if (indexRef.current >= typewriterText.length) {
          clearInterval(interval)
          setDone(true)
          timeout = setTimeout(startTyping, 1800)
        }
      }, 75)
    }

    startTyping()

    return () => clearTimeout(timeout)
  }, [started, typewriterText])

  return (
    <section ref={sectionRef} className="py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2
          className="mb-4"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            whiteSpace: "nowrap",
            minHeight: "1.3em",
          }}
        >
          {displayed}
          {started && !done && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1em",
                background: "var(--color-brand)",
                marginLeft: "2px",
                verticalAlign: "middle",
                animation: "blink 0.8s step-end infinite",
              }}
            />
          )}
        </h2>
        <p
          className="mb-8 text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          {t("promo.ctaSubtitle")}
        </p>

        <Link href={registerHref}>
          <Button className="ds-btn-primary h-12 px-8 text-base">
            <Gift className="mr-2 h-5 w-5" />
            {t("promo.ctaButton")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
