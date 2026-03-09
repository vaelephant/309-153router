"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const navLinks = [
  { href: "#features", label: "核心功能" },
  { href: "#how-it-works", label: "工作原理" },
  { href: "#pricing", label: "价格方案" },
  { href: "#docs", label: "开发文档" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: 'rgba(var(--color-border-default-rgb), 0.1)',
        backgroundColor: 'rgba(var(--color-bg-page-rgb), 0.8)',
      }}
    >
      <nav 
        className="mx-auto flex h-16 items-center justify-between px-6 max-w-7xl"
      >
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          style={{ 
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '20px',
            letterSpacing: '-0.04em',
          }}
        >
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
            style={{
              background: 'var(--color-accent-primary)',
              color: 'white',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 900 }}>O</span>
          </div>
          <span>OptRouter</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold transition-colors hover:text-[var(--color-accent-primary)]"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs font-bold"
              style={{
                color: 'var(--color-text-secondary)',
              }}
            >
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button 
              size="sm"
              className="ds-btn-primary h-9 px-5 text-xs font-bold"
            >
              立即接入
            </Button>
          </Link>
          <div className="ml-2 pl-4 border-l border-[var(--color-border-default)]">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              color: 'var(--color-text-primary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
            aria-label="菜单"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="border-t md:hidden"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <div className="flex flex-col gap-4 p-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold transition-colors hover:text-foreground"
                style={{
                  color: 'var(--color-text-body)',
                  textDecoration: 'none',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/login" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  style={{
                    borderColor: 'var(--color-border-default)',
                    color: 'var(--color-text-body)',
                  }}
                >
                  登录
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button 
                  className="w-full ds-btn-primary"
                >
                  立即接入
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
