"use client"

import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer 
      className="border-t py-16"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-page)',
      }}
    >
      <div 
        className="mx-auto px-6 max-w-7xl"
      >
        <div className="flex flex-col items-center justify-between gap-10 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-4">
            <Link 
              href="/" 
              className="text-xl font-bold tracking-tighter text-[var(--color-text-primary)]"
            >
              OptRouter
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs text-center sm:text-left leading-relaxed">
              多模型时代的智能路由层。
              自动在成本、质量和速度之间实现更优平衡。
            </p>
          </div>
          
          <div 
            className="flex flex-wrap justify-center gap-x-10 gap-y-4"
          >
            <Link href="#features" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">核心功能</Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">价格方案</Link>
            <Link href="/docs" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">开发文档</Link>
            <Link href="/privacy" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">隐私政策</Link>
          </div>
          
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
            © {currentYear} OptRouter
          </p>
        </div>
      </div>
    </footer>
  )
}
