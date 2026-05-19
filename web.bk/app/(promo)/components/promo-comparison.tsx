"use client"

import { Check, X } from "lucide-react"

const COMPARISON_DATA = [
  {
    feature: "GPT-4o 输入价格 / 1K tokens",
    direct: "¥0.0175",
    optrouter: "¥0.011",
    saving: true,
  },
  {
    feature: "GPT-4o 输出价格 / 1K tokens",
    direct: "¥0.07",
    optrouter: "¥0.044",
    saving: true,
  },
  {
    feature: "Claude 3.5 输入价格 / 1K tokens",
    direct: "¥0.021",
    optrouter: "¥0.013",
    saving: true,
  },
  {
    feature: "自动故障转移",
    direct: null,
    optrouter: true,
    saving: false,
  },
  {
    feature: "智能路由选最优",
    direct: null,
    optrouter: true,
    saving: false,
  },
  {
    feature: "统一 API 管理多供应商",
    direct: null,
    optrouter: true,
    saving: false,
  },
]

export function PromoComparison() {
  return (
    <section
      className="py-20"
      style={{ backgroundColor: "var(--color-bg-surface)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="mb-4 text-center"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          为什么更划算？
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "var(--color-text-body)" }}
        >
          直接调用 vs OptRouter 智能路由，对比一目了然
        </p>

        <div
          className="overflow-hidden rounded-xl"
          style={{
            border: "1px solid var(--color-border-default)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--color-bg-muted)",
                  borderBottom: "1px solid var(--color-border-default)",
                }}
              >
                <th
                  className="px-5 py-3 text-left text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  对比项
                </th>
                <th
                  className="px-5 py-3 text-center text-xs font-semibold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  直接调用
                </th>
                <th
                  className="px-5 py-3 text-center text-xs font-semibold"
                  style={{ color: "var(--color-brand)" }}
                >
                  OptRouter ✨
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < COMPARISON_DATA.length - 1
                        ? "1px solid var(--color-border-subtle)"
                        : "none",
                    backgroundColor: "var(--color-bg-surface)",
                  }}
                >
                  <td
                    className="px-5 py-3 text-sm"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {row.feature}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {row.direct === null ? (
                      <X
                        className="mx-auto h-4 w-4"
                        style={{ color: "var(--color-text-muted)" }}
                      />
                    ) : (
                      <span
                        className="text-sm tabular-nums"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {row.direct}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {row.optrouter === true ? (
                      <Check
                        className="mx-auto h-4 w-4"
                        style={{ color: "var(--color-brand)" }}
                      />
                    ) : (
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {row.optrouter as string}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
