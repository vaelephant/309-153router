"use client"

import { useState, useEffect, Children } from "react"

const STAGGER_MS = 280
const DURATION_MS = 600

/**
 * 包裹主页区块，使子组件像瀑布流一样依次动态显示（淡入 + 自下而上）
 * 尊重 prefers-reduced-motion：系统开启减少动效时立即展示，无延迟动画
 */
export function WaterfallReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const childArray = Children.toArray(children)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [visible, setVisible] = useState<boolean[]>(() => childArray.map(() => false))

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => {
      const reduced = mq.matches
      setReduceMotion(reduced)
      if (reduced) {
        setVisible(childArray.map(() => true))
      }
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [childArray.length])

  useEffect(() => {
    if (reduceMotion) return

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
    return () => timers.forEach(clearTimeout)
  }, [childArray.length, reduceMotion])

  return (
    <div className={className}>
      {childArray.map((child, i) => (
        <div
          key={i}
          className={reduceMotion ? "" : "transition-all ease-out"}
          style={
            reduceMotion
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
