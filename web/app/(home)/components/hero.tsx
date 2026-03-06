"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Copy, Check } from "lucide-react"
import { useState } from "react"

export function Hero() {
  const [copied, setCopied] = useState(false)

  const copyCommand = () => {
    navigator.clipboard.writeText("curl https://api.optrouter.com/v1/chat/completions -H 'Authorization: Bearer YOUR_API_KEY' -d '{\"model\":\"gpt-4o\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section 
      className="relative min-h-screen overflow-hidden pt-16"
      style={{
        paddingTop: 'var(--layout-section-spacing)',
        paddingBottom: 'var(--layout-section-spacing)',
      }}
    >
      <div 
        className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-6 text-center"
        style={{ maxWidth: 'var(--layout-max-width)' }}
      >
        {/* Main Heading */}
        <h1 
          style={{
            fontSize: 'clamp(40px, 8vw, 64px)',
            fontWeight: 700,
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-5)',
            maxWidth: '900px',
          }}
        >
          AI 模型的
          <br />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            统一入口
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: 'var(--color-text-body)',
            maxWidth: '600px',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-9)',
          }}
        >
          一个 API 调用所有 AI 模型。兼容 OpenAI 格式，支持智能路由与自动切换。
          简化开发，统一计费，无需管理多个 API 密钥。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button 
              size="lg" 
              className="ds-btn-primary"
              style={{
                height: '48px',
                padding: '14px 28px',
                fontSize: '16px',
              }}
            >
              免费开始
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {/* API Example */}
          <button
            onClick={copyCommand}
            className="flex h-12 items-center gap-3 rounded-lg border px-4 font-mono text-sm transition-colors hover:border-foreground/20"
            style={{
              borderColor: 'var(--color-border-default)',
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              transition: 'border-color var(--motion-base) var(--ease-standard)',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>$</span>
            <span className="hidden sm:inline">curl api.optrouter.com/v1/chat/completions</span>
            <span className="sm:hidden">查看 API 示例</span>
            {copied ? (
              <Check className="h-4 w-4" style={{ color: 'var(--color-accent-primary)' }} />
            ) : (
              <Copy className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            )}
          </button>
        </div>

        {/* Trust Badges */}
        <div 
          className="mt-20 flex flex-col items-center gap-6"
          style={{ marginTop: 'var(--space-9)' }}
        >
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--color-text-muted)',
          }}>
            兼容 OpenAI API，支持所有主流 AI 框架
          </p>
          <div 
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
            style={{ opacity: 0.5 }}
          >
            {["OpenAI SDK", "LangChain", "LlamaIndex", "Vercel AI", "Next.js"].map((tech) => (
              <span 
                key={tech} 
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
