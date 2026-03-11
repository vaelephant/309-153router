"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface LayoutTextFlipProps {
  text?: string
  words: string[]
  duration?: number
  className?: string
  wordClassName?: string
}

export function LayoutTextFlip({
  text,
  words,
  duration = 3000,
  className,
  wordClassName,
}: LayoutTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined)
  const measureRef = useRef<HTMLSpanElement>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)

  // 测量所有词取最大宽度，容器宽度固定，静态文字不会左右移动
  const measureMaxWidth = useCallback(() => {
    if (hiddenRef.current) {
      const spans = hiddenRef.current.children
      let max = 0
      for (let i = 0; i < spans.length; i++) {
        max = Math.max(max, (spans[i] as HTMLElement).offsetWidth)
      }
      if (max > 0) setMaxWidth(max)
    }
  }, [])

  useEffect(() => {
    measureMaxWidth()
    window.addEventListener("resize", measureMaxWidth)
    return () => window.removeEventListener("resize", measureMaxWidth)
  }, [measureMaxWidth])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 400) // 动画持续时间的一半，用于切换
    }, duration)

    return () => clearInterval(interval)
  }, [words.length, duration])

  return (
    <span className={cn("inline-flex items-baseline justify-center gap-x-3 whitespace-nowrap", className)}>
      {/* 隐藏的测量容器 */}
      <div
        ref={hiddenRef}
        aria-hidden
        className="absolute pointer-events-none opacity-0 h-0 overflow-hidden"
        style={{ whiteSpace: "nowrap" }}
      >
        {words.map((word) => (
          <span key={word} className={cn("inline-block font-semibold", wordClassName)}>
            {word}
          </span>
        ))}
      </div>

      {/* 静态文本 */}
      {text && <span className="shrink-0">{text}</span>}

      {/* 翻转文字容器：固定最大宽度，静态文字不随之移动 */}
      <span
        className="relative inline-flex overflow-hidden shrink-0"
        style={{
          width: maxWidth ? `${maxWidth}px` : "auto",
          verticalAlign: "baseline",
        }}
      >
        <span
          ref={measureRef}
          className={cn(
            "inline-block font-semibold transition-all duration-500",
            wordClassName,
            isAnimating
              ? "translate-y-[-110%] opacity-0 blur-[2px]"
              : "translate-y-0 opacity-100 blur-0"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {words[currentIndex]}
        </span>
      </span>
    </span>
  )
}
