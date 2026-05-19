"use client"

import { useState, useEffect, Children } from "react"

const STAGGER_MS = 280
const DURATION_MS = 600

/**
 * 包裹主页区块，使子组件像瀑布流一样依次动态显示（淡入 + 自下而上）
 */
export function WaterfallReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const childArray = Children.toArray(children)
  const [visible, setVisible] = useState<boolean[]>(() => childArray.map(() => false))

  useEffect(() => {
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
  }, [childArray.length])

  return (
    <div className={className}>
      {childArray.map((child, i) => (
        <div
          key={i}
          className="transition-all ease-out"
          style={{
            transitionProperty: "opacity, transform",
            transitionDuration: `${DURATION_MS}ms`,
            opacity: visible[i] ? 1 : 0,
            transform: visible[i] ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
