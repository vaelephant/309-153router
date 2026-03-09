"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Copy, Check } from "lucide-react"
import { useState, useCallback, useRef, useEffect } from "react"

const CURL_COMMAND = `curl https://api.optrouter.com/v1/chat/completions -H 'Authorization: Bearer YOUR_API_KEY' -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`
const COPY_RESET_MS = 2000
const TRUST_TECHS = ["OpenAI", "Anthropic", "Google Gemini", "DeepSeek", "Ollama", "LangChain"]

export function Hero() {
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CURL_COMMAND)
      copyTimeoutRef.current && clearTimeout(copyTimeoutRef.current)
      setCopied(true)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch {
      // Fallback or ignore when clipboard fails (e.g. non-HTTPS)
    }
  }, [])

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [])

  return (
    <section
      className="hero relative min-h-screen overflow-hidden"
      aria-label="产品介绍"
    >
      <div
        className="hero-glow absolute inset-0 -z-10 pointer-events-none"
        aria-hidden
      />

      <div className="hero-inner relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
        {/* 顶部 Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-sm"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'rgba(var(--color-bg-surface-rgb), 0.5)',
            color: 'var(--color-text-body)',
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          />
          多模型时代的智能路由层
        </div>

        <h1 className="hero-title tracking-tight font-bold">
          一个接口，接入多家大模型。
          <br />
          <span className="text-[var(--color-accent-primary)]">一次请求，自动选择更合适的模型。</span>
        </h1>

        <p className="hero-subtitle mt-6 max-w-[720px] text-lg leading-relaxed text-[var(--color-text-body)]">
          OptRouter 是面向开发者与企业的智能模型路由平台，统一聚合多家 LLM，并根据任务特征自动完成模型选择，在质量、速度与成本之间实现更优平衡。
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button className="ds-btn-primary h-12 px-8 text-base font-medium">
              立即接入
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>

          <button
            type="button"
            onClick={copyCommand}
            className="hero-copy-btn flex h-12 items-center gap-3 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-6 text-sm font-medium text-[var(--color-text-body)] transition-all hover:border-[var(--color-accent-primary)]/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            aria-label={copied ? "已复制" : "复制 curl 示例命令"}
          >
            <span className="text-[var(--color-accent-primary)] font-mono" aria-hidden>$</span>
            <span className="hidden sm:inline font-mono">curl api.optrouter.com/v1</span>
            <span className="sm:hidden">查看 API</span>
            {copied ? (
              <Check className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden />
            ) : (
              <Copy className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
            )}
          </button>
        </div>

        <div className="hero-trust mt-24 flex flex-col items-center gap-6">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-text-muted)]">
            已支持接入
          </p>
          <div className="hero-trust-list flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-40 grayscale transition-all hover:opacity-70 hover:grayscale-0">
            {TRUST_TECHS.map((tech) => (
              <span key={tech} className="text-sm font-bold tracking-tight text-[var(--color-text-secondary)]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
