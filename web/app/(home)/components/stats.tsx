const stats = [
  {
    value: "统一 API 接入",
    label: "覆盖多家主流大模型供应商",
  },
  {
    value: "智能路由决策",
    label: "为每次请求匹配最优路径",
  },
  {
    value: "成本大幅降低",
    label: "优化不必要的高价调用支出",
  },
  {
    value: "内建故障切换",
    label: "多提供商冗余保障高可用",
  },
]

export function Stats() {
  return (
    <section 
      className="border-t py-16"
      style={{
        borderColor: 'var(--color-border-default)',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-8)',
      }}
    >
      <div 
        className="mx-auto px-6"
      >
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center group"
            >
              <div 
                className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2 transition-colors group-hover:text-[var(--color-accent-primary)]"
              >
                {stat.value}
              </div>
              <div 
                className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-muted)]"
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
