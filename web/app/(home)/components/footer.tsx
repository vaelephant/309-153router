"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"

const footerLinks = {
  产品: [
    { label: "模型", href: "#models" },
    { label: "定价", href: "#pricing" },
    { label: "API 文档", href: "#docs" },
    { label: "更新日志", href: "#" },
  ],
  资源: [
    { label: "快速入门", href: "#" },
    { label: "示例代码", href: "#" },
    { label: "集成指南", href: "#" },
    { label: "API 参考", href: "#" },
  ],
  公司: [
    { label: "关于我们", href: "#" },
    { label: "博客", href: "#" },
    { label: "加入我们", href: "#" },
    { label: "联系我们", href: "#" },
  ],
  法律: [
    { label: "服务条款", href: "#" },
    { label: "隐私政策", href: "#" },
    { label: "安全合规", href: "#" },
    { label: "DPA", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer 
      className="border-t"
      style={{
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div 
        className="mx-auto max-w-7xl px-6 py-16"
        style={{ 
          maxWidth: 'var(--layout-max-width)',
          paddingTop: 'var(--space-9)',
          paddingBottom: 'var(--space-9)',
        }}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link 
              href="/" 
              className="flex items-center gap-2"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '18px',
                letterSpacing: '-0.02em',
              }}
            >
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'var(--color-button-primary-bg)',
                  color: 'var(--color-button-primary-text)',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700 }}>O</span>
              </div>
              <span>OptRouter</span>
            </Link>
            <p 
              style={{
                marginTop: 'var(--space-4)',
                maxWidth: '300px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--color-text-body)',
              }}
            >
              AI 模型的统一入口。一个 API 连接所有 AI 模型，简化开发，按需付费。
            </p>
            <div 
              className="mt-6 flex gap-4"
              style={{ marginTop: 'var(--space-6)' }}
            >
              <a
                href="#"
                className="transition-colors hover:text-foreground"
                style={{
                  color: 'var(--color-text-body)',
                  transition: 'color var(--motion-base) var(--ease-standard)',
                }}
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="transition-colors hover:text-foreground"
                style={{
                  color: 'var(--color-text-body)',
                  transition: 'color var(--motion-base) var(--ease-standard)',
                }}
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {category}
              </h3>
              <ul 
                className="mt-4 space-y-3"
                style={{ marginTop: 'var(--space-4)' }}
              >
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-foreground"
                      style={{
                        color: 'var(--color-text-body)',
                        textDecoration: 'none',
                        transition: 'color var(--motion-base) var(--ease-standard)',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div 
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{
            marginTop: 'var(--space-9)',
            borderColor: 'var(--color-border-default)',
            paddingTop: 'var(--space-6)',
          }}
        >
          <p 
            style={{
              fontSize: '14px',
              color: 'var(--color-text-body)',
            }}
          >
            © 2024 OptRouter. 保留所有权利。
          </p>
          <div 
            className="flex items-center gap-1 text-sm"
            style={{ color: 'var(--color-text-body)' }}
          >
            <span 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            />
            所有系统运行正常
          </div>
        </div>
      </div>
    </footer>
  )
}
