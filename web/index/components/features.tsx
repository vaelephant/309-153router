import { Zap, Shield, Globe, Code, BarChart3, Layers } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "极速响应",
    description: "全球分布式边缘网络，平均延迟低于 50ms，确保您的应用始终快速响应。",
  },
  {
    icon: Shield,
    title: "企业级安全",
    description: "SOC 2 Type II 认证，端到端加密，数据隔离存储，满足最严格的合规要求。",
  },
  {
    icon: Globe,
    title: "全球覆盖",
    description: "支持 50+ 顶尖 AI 模型，覆盖文本、图像、音频、视频等多种模态。",
  },
  {
    icon: Code,
    title: "简单集成",
    description: "兼容 OpenAI SDK，一行代码切换模型提供商，无需重写现有代码。",
  },
  {
    icon: BarChart3,
    title: "实时监控",
    description: "详细的用量统计、成本分析和性能指标，让您对 AI 支出了如指掌。",
  },
  {
    icon: Layers,
    title: "智能路由",
    description: "自动负载均衡和故障转移，根据延迟、成本或性能智能选择最优模型。",
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
        className="mx-auto max-w-7xl px-6"
        style={{ maxWidth: 'var(--layout-max-width)' }}
      >
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            为什么选择 OptRouter
          </h2>
          <p 
            style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: 'var(--color-text-body)',
              marginTop: 'var(--space-4)',
            }}
          >
            我们提供业界领先的 AI 聚合平台，让您专注于产品创新
          </p>
        </div>

        {/* Features Grid */}
        <div 
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            marginTop: 'var(--space-8)',
            gap: 'var(--space-5)',
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="ds-card group"
              style={{
                padding: 'var(--space-6)',
              }}
            >
              <div 
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {feature.title}
              </h3>
              <p 
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--color-text-body)',
                  marginTop: 'var(--space-2)',
                }}
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
