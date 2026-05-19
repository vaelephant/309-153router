"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gift, ArrowRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"

interface PromoCtaProps {
  registerHref: string
}

const TYPEWRITER_TEXT = "卖AI工具赚一次钱，卖 AI 基础设施赚十年钱"

export function PromoCta({ registerHref }: PromoCtaProps) {
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
        setDisplayed(TYPEWRITER_TEXT.slice(0, indexRef.current))
        if (indexRef.current >= TYPEWRITER_TEXT.length) {
          clearInterval(interval)
          setDone(true)
          timeout = setTimeout(startTyping, 1800)
        }
      }, 75)
    }

    startTyping()

    return () => clearTimeout(timeout)
  }, [started])

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
          注册只需 30 秒，邀请一位好友就能赚 ¥20，何乐而不为？
        </p>

        <Link href={registerHref}>
          <Button className="ds-btn-primary h-12 px-8 text-base">
            <Gift className="mr-2 h-5 w-5" />
            现在就开始邀请好友
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
