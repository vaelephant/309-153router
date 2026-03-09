import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section 
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
        <div 
          className="relative overflow-hidden rounded-[2rem] border px-8 py-20 text-center sm:px-16 group"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          {/* Animated background element */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-accent-primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative max-w-2xl mx-auto">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-primary)] mb-6"
            >
              立即开始
            </p>
            <h2 
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mb-8"
            >
              在更智能的模型层上开始构建
            </h2>
            <p 
              className="text-lg sm:text-xl text-[var(--color-text-body)] mb-12 leading-relaxed"
            >
              从一个 API 接入，跨越多个模型供应商，让路由来完成优化。
            </p>
            <div 
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="ds-btn-primary h-14 px-10 text-lg font-semibold"
                >
                  立即接入
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#docs">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-10 text-lg font-semibold border-2"
                >
                  查看文档
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
