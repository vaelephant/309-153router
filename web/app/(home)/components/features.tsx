import { Zap, Shield, Globe, Route } from "lucide-react"

const features = [
  {
    icon: Globe,
    title: "统一接入",
    subtitle: "Unified LLM Access",
    description: "不再逐个对接模型厂商，一个接口统一接入多家主流模型。无需管理多个密钥，降低集成难度。",
  },
  {
    icon: Route,
    title: "智能路由",
    subtitle: "Intelligent Routing",
    description: "让系统自动为不同任务选择更合适的模型。简单任务更省钱，复杂任务更高质量，实现动态平衡。",
  },
  {
    icon: Zap,
    title: "成本优化",
    subtitle: "Cost Optimization",
    description: "避免不必要的高价调用。在价格、延迟与能力之间自动平衡，显著降低整体 AI 使用成本。",
  },
  {
    icon: Shield,
    title: "稳定性保障",
    subtitle: "Reliability by Design",
    description: "内建故障切换与多提供商冗余。即使某家供应商发生故障，也能自动 fallback，保障业务不中断。",
  },
]

export function Features() {
  return (
    <section 
      id="features" 
      className="border-t py-24"
      style={{
        borderColor: 'var(--color-border-default)',
        paddingTop: 'var(--layout-section-spacing)',
        paddingBottom: 'var(--layout-section-spacing)',
      }}
    >
      <div 
        className="mx-auto px-6"
      >
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-primary)] mb-4"
          >
            为什么选择 OptRouter
          </p>
          <h2 
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mb-6"
          >
            让多模型调用更简单，也更聪明
          </h2>
          <p 
            className="text-lg leading-relaxed text-[var(--color-text-body)]"
          >
            OptRouter 不只是聚合层，更是决策层——聚合解决接入问题，路由解决效果、成本和稳定性问题。
          </p>
        </div>

        {/* Features Grid */}
        <div 
          className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="ds-card group relative overflow-hidden transition-all hover:border-[var(--color-accent-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-accent-primary)]/5"
              style={{
                padding: 'var(--space-6)',
              }}
            >
              <div 
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:bg-[var(--color-accent-primary)] group-hover:text-white"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="mb-3">
                <h3 
                  className="text-lg font-bold text-[var(--color-text-primary)]"
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-1"
                >
                  {feature.subtitle}
                </p>
              </div>
              <p 
                className="text-sm leading-relaxed text-[var(--color-text-body)]"
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
