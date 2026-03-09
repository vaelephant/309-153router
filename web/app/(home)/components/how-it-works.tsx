const steps = [
  {
    step: "01",
    title: "所有请求统一发给 OptRouter",
    description:
      "通过一个统一入口承接所有大模型调用。无需为每家厂商维护不同的 SDK 和密钥，完全兼容 OpenAI 格式。",
    detail: "baseURL: https://api.optrouter.com/v1",
  },
  {
    step: "02",
    title: "OptRouter 自动分析并路由",
    description:
      "根据任务类型、上下文、质量要求和成本偏好选择合适模型。系统会自动评估每次请求的最佳路径。",
    detail: "智能路由 · 成本感知 · 延迟优化",
  },
  {
    step: "03",
    title: "返回更优结果",
    description:
      "模型执行请求，系统同时提供故障兜底、流式响应、用量统计和可观测性支持。",
    detail: "故障切换 · 可观测性 · 统计分析",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t py-24"
      style={{
        borderColor: "var(--color-border-default)",
        paddingTop: "var(--layout-section-spacing)",
        paddingBottom: "var(--layout-section-spacing)",
      }}
    >
      <div className="mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-primary)] mb-4"
          >
            工作流程
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]"
          >
            三步完成智能路由
          </h2>
          <p
            className="mt-6 text-lg leading-relaxed text-[var(--color-text-body)]"
          >
            从接入到返回结果，OptRouter 在中间完成所有路由决策，对调用方完全透明。
          </p>
        </div>

        {/* Steps */}
        <div
          className="mt-20 grid gap-12 lg:grid-cols-3"
        >
          {steps.map((s, index) => (
            <div key={s.step} className="relative group">
              {/* Connector line between steps (desktop) */}
              {index < steps.length - 1 && (
                <div
                  className="absolute top-6 hidden lg:block"
                  style={{
                    left: "calc(100% + 24px)",
                    width: "calc(100% - 48px)",
                    height: "1px",
                    backgroundColor: "var(--color-border-default)",
                    transform: "translateX(-50%)",
                  }}
                  aria-hidden
                />
              )}

              {/* Step number */}
              <div className="flex items-center gap-6 mb-8">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all group-hover:bg-[var(--color-accent-primary)] group-hover:text-white group-hover:border-[var(--color-accent-primary)]"
                  style={{
                    backgroundColor: "var(--color-bg-muted)",
                    color: "var(--color-accent-primary)",
                    border: "1px solid var(--color-border-default)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {s.step}
                </div>
                <div
                  className="h-px flex-1 lg:hidden"
                  style={{ backgroundColor: "var(--color-border-default)" }}
                  aria-hidden
                />
              </div>

              {/* Content */}
              <div>
                <h3
                  className="text-xl font-bold text-[var(--color-text-primary)] mb-4"
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-[var(--color-text-body)] mb-6"
                >
                  {s.description}
                </p>

                {/* Detail tag */}
                <div
                  className="inline-block rounded-lg px-4 py-2 border border-dashed transition-colors group-hover:border-[var(--color-accent-primary)]/30 group-hover:bg-[var(--color-accent-primary)]/5"
                  style={{
                    backgroundColor: "var(--color-bg-muted)",
                    borderColor: "var(--color-border-default)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {s.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
