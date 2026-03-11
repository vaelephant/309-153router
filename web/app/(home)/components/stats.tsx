"use client"

import { useRef, useEffect, useState } from "react"

const stats = [
  { value: "50+", label: "AI 模型" },
  { value: "10B+", label: "API 调用/月" },
  { value: "99.99%", label: "服务可用性" },
  { value: "< 50ms", label: "平均延迟" },
]

export function Stats() {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { rootMargin: "0px", threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="border-t py-16"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--space-7)",
        paddingBottom: "var(--space-7)",
      }}
    >
      <div className="mx-auto px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center transition-all duration-700 ease-out"
              style={{
                transitionDelay: inView ? `${i * 120}ms` : "0ms",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(32px, 5vw, 48px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                  lineHeight: "1.2",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  marginTop: "var(--space-2)",
                  fontSize: "14px",
                  color: "var(--color-text-body)",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
