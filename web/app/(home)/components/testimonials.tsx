"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    name: "张明",
    role: "全栈工程师",
    company: "创新科技",
    content: "OptRouter 让我们的 AI 集成变得非常简单，只需要换一个 baseURL 就能接入所有模型。智能路由帮我们节省了 30% 的成本。",
    rating: 5,
  },
  {
    name: "李婷",
    role: "技术总监",
    company: "数据智能",
    content: "之前要管理多家 AI 供应商的 API Key 和计费，非常麻烦。用了 OptRouter 后，统一管理和统一计费让运维工作量减少了一半。",
    rating: 5,
  },
  {
    name: "王磊",
    role: "产品经理",
    company: "智联网络",
    content: "落地页到生产环境只用了半天，文档清晰、API 兼容性好。自动 fallback 机制让我们的服务稳定性大幅提升。",
    rating: 5,
  },
  {
    name: "陈晓",
    role: "后端开发",
    company: "云智科技",
    content: "我们团队同时用 GPT-4o 和 Claude，之前需要维护两套 SDK。接入 OptRouter 后统一成一套，代码简洁了很多。",
    rating: 5,
  },
  {
    name: "赵雪",
    role: "AI 算法工程师",
    company: "深度未来",
    content: "最吸引我的是智能路由功能，自动帮我选择性价比最高的模型，同样的效果花更少的钱。强烈推荐！",
    rating: 5,
  },
  {
    name: "孙浩",
    role: "CTO",
    company: "极速传媒",
    content: "用量分析面板非常直观，能清楚看到每个模型的调用量和花费，帮助我们做预算规划。客服响应也很快。",
    rating: 5,
  },
  {
    name: "刘佳",
    role: "独立开发者",
    company: "自由职业",
    content: "注册即送额度，接口响应速度很快。作为个人开发者，能用一个 API 调用所有主流大模型，太方便了。",
    rating: 5,
  },
  {
    name: "周文",
    role: "架构师",
    company: "金山软件",
    content: "对我们来说最重要的是高可用。OptRouter 的自动 fallback 让我们的 SLA 从 99.5% 提升到了 99.95%，运维省心了。",
    rating: 5,
  },
  {
    name: "黄丽",
    role: "数据科学家",
    company: "医疗 AI",
    content: "在医疗场景中需要频繁切换不同模型做测试，OptRouter 的统一接口省去了大量适配工作，开发效率提升明显。",
    rating: 5,
  },
  {
    name: "吴凡",
    role: "前端负责人",
    company: "电商平台",
    content: "接入过程零门槛，OpenAI SDK 直接改 baseURL 就能用。流式输出兼容性很好，用户体验和原来一样流畅。",
    rating: 5,
  },
]

// 将名字中间加*号，如"张明" -> "张*明"，"李婷" -> "李*婷"
function maskName(name: string): string {
  if (name.length <= 1) return name
  if (name.length === 2) {
    return `${name[0]}*${name[1]}`
  }
  // 3个字及以上：保留第一个和最后一个，中间用*代替
  return `${name[0]}*${name[name.length - 1]}`
}

function TestimonialCard({ t }: { t: typeof testimonials[number] }) {
  const maskedName = maskName(t.name)
  
  return (
    <div
      className="flex-shrink-0 w-[340px] rounded-xl border p-6"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-amber-400 text-amber-400"
          />
        ))}
      </div>
      <p
        className="mb-6 text-sm leading-relaxed line-clamp-4"
        style={{ color: 'var(--color-text-body)' }}
      >
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-accent-soft)',
            color: 'var(--color-brand)',
          }}
        >
          {t.name[0]}
        </div>
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {maskedName}
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.role} · {t.company}
          </p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  // 复制一份用于无缝循环
  const items = [...testimonials, ...testimonials]

  return (
    <section
      id="testimonials"
      className="border-t py-24 overflow-hidden"
      style={{
        borderColor: 'var(--color-border-default)',
        paddingTop: 'var(--layout-section-spacing)',
        paddingBottom: 'var(--layout-section-spacing)',
      }}
    >
      <div className="mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            用户反馈
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-body)',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            来自真实用户的使用体验
          </p>
        </div>
      </div>

      {/* 跑马灯 - 向左滚动 */}
      <div className="relative">
        <div className="flex gap-6 animate-marquee">
          {items.map((t, i) => (
            <TestimonialCard key={`a-${i}`} t={t} />
          ))}
        </div>

        {/* 左右渐变遮罩 */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24"
          style={{
            background: 'linear-gradient(to right, var(--color-bg-page), transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24"
          style={{
            background: 'linear-gradient(to left, var(--color-bg-page), transparent)',
          }}
        />
      </div>
    </section>
  )
}
