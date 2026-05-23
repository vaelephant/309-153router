"use client"

import { useState, useEffect, Children } from "react"

const STAGGER_MS = 280
const DURATION_MS = 600
const REVEALED_KEY = "optrouter_home_sections_revealed"

function allVisible(count: number) {
  return Array.from({ length: count }, () => true)
}

function hasRevealedBefore(): boolean {
  if (typeof window === "undefined") return false
  try {
    return sessionStorage.getItem(REVEALED_KEY) === "1"
  } catch {
    return false
  }
}

/**
 * 包裹主页区块，使子组件像瀑布流一样依次动态显示（淡入 + 自下而上）
 * 同一会话内只播一次，避免重载时整块内容再次「刷新」入场
 */
export function WaterfallReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const childArray = Children.toArray(children)
  const count = childArray.length
  const revealedBefore = hasRevealedBefore()

  const [reduceMotion, setReduceMotion] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(revealedBefore)
  const [visible, setVisible] = useState<boolean[]>(() =>
    revealedBefore ? allVisible(count) : allVisible(count).map(() => false)
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => {
      const reduced = mq.matches
      setReduceMotion(reduced)
      if (reduced) {
        setVisible(allVisible(count))
        setSkipAnimation(true)
      }
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [count])

  useEffect(() => {
    if (reduceMotion || skipAnimation || revealedBefore) return

    const timers: ReturnType<typeof setTimeout>[] = []
    childArray.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisible((v) => {
            const next = [...v]
            next[i] = true
            return next
          })
        }, i * STAGGER_MS)
      )
    })

    const doneTimer = setTimeout(
      () => {
        try {
          sessionStorage.setItem(REVEALED_KEY, "1")
        } catch {
          // ignore
        }
        setSkipAnimation(true)
      },
      (count - 1) * STAGGER_MS + DURATION_MS + 50
    )

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(doneTimer)
    }
  }, [count, reduceMotion, skipAnimation, revealedBefore])

  const showStatic = reduceMotion || skipAnimation

  return (
    <div className={className}>
      {childArray.map((child, i) => (
        <div
          key={i}
          className={showStatic ? "" : "transition-all ease-out"}
          style={
            showStatic
              ? undefined
              : {
                  transitionProperty: "opacity, transform",
                  transitionDuration: `${DURATION_MS}ms`,
                  opacity: visible[i] ? 1 : 0,
                  transform: visible[i] ? "translateY(0)" : "translateY(20px)",
                }
          }
        >
          {child}
        </div>
      ))}
    </div>
  )
}
