"use client"

import { useEffect, useMemo, useState } from "react"
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Settings,
  CreditCard,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  Users,
  Wallet,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { LocaleLink } from "@/components/locale-link"
import { usePathname, useRouter } from "next/navigation"
import { clearUserAuth, getCurrentUserPhone, getCurrentUserId, isSuperadmin } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

const userNavItems = [
  { icon: LayoutDashboard, labelKey: "dashboard.overview", id: "overview", href: "/dashboard" },
  { icon: Key, labelKey: "dashboard.apiKeys", id: "keys", href: "/keys" },
  { icon: Users, labelKey: "dashboard.invite", id: "invite", href: "/invite" },
  { icon: BarChart3, labelKey: "dashboard.analytics", id: "analytics", href: "/analytics" },
  { icon: Wallet, labelKey: "dashboard.recharge", id: "recharge", href: "/recharge" },
  { icon: CreditCard, labelKey: "dashboard.billing", id: "billing", href: "/billing" },
  { icon: BookOpen, labelKey: "dashboard.docs", id: "docs", href: "/docs" },
  { icon: Settings, labelKey: "dashboard.settings", id: "settings", href: "/settings" },
  { icon: ShieldCheck, labelKey: "dashboard.modelManage", id: "superadmin", href: "/superadmin" },
]

const superadminNavItems = [
  { icon: LayoutDashboard, labelKey: "dashboard.backToUser", id: "overview", href: "/dashboard" },
  { icon: ShieldCheck, labelKey: "dashboard.modelManage", id: "superadmin", href: "/superadmin" },
]

interface PlanInfo {
  planName: string
  usedAmount: number
  totalAmount: number
  balance: number
}

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useI18n()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("sidebar-collapsed") === "true"
  })

  const toggleCollapsed = (value: boolean) => {
    setCollapsed(value)
    localStorage.setItem("sidebar-collapsed", String(value))
  }
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  useEffect(() => {
    setUserPhone(getCurrentUserPhone())
  }, [])

  useEffect(() => {
    async function fetchPlanInfo() {
      const userId = getCurrentUserId()
      if (!userId) {
        setPlanLoading(false)
        return
      }

      try {
        const response = await fetch(`/${locale}/api/plan`, {
          headers: { 'x-user-id': userId },
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            setPlanInfo(result.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch plan info:', error)
      } finally {
        setPlanLoading(false)
      }
    }

    fetchPlanInfo()
  }, [locale])

  const initials = useMemo(() => {
    const p = (userPhone || "").replace(/\D/g, "")
    if (p.length >= 4) return p.slice(-4)
    if (p.length > 0) return p
    return "U"
  }, [userPhone])

  const activeItem = useMemo(() => {
    if (pathname?.endsWith("/dashboard")) return "overview"
    if (pathname?.endsWith("/invite")) return "invite"
    if (pathname?.includes("/keys")) return "keys"
    if (pathname?.includes("/analytics")) return "analytics"
    if (pathname?.includes("/recharge")) return "recharge"
    if (pathname?.includes("/billing")) return "billing"
    if (pathname?.includes("/docs")) return "docs"
    if (pathname?.includes("/settings")) return "settings"
    if (pathname?.includes("/superadmin")) return "superadmin"
    return "overview"
  }, [pathname])

  const isSuperadminView = pathname?.includes("/superadmin")
  // 根据用户角色过滤菜单项：只有 superadmin 才能看到"模型管理"
  const filteredUserNavItems = userNavItems.filter(item => {
    if (item.id === "superadmin") {
      return isSuperadmin()
    }
    return true
  })
  const navItems = isSuperadminView ? superadminNavItems : filteredUserNavItems

  const handleLogout = () => {
    clearUserAuth()
    router.replace(`/${locale}/login`)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border",
            collapsed ? "justify-between px-2" : "gap-2 px-3"
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-primary",
              collapsed ? "size-7" : "size-8"
            )}
          >
            <Layers className={cn(collapsed ? "size-3.5" : "size-4", "text-primary-foreground")} />
          </div>
          {!collapsed && (
            <span className="flex-1 text-sm font-semibold text-sidebar-foreground tracking-tight">
              OptRouter
            </span>
          )}
          <button
            onClick={() => toggleCollapsed(!collapsed)}
            className="flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            aria-label={collapsed ? t("dashboard.expand") : t("dashboard.collapse")}
          >
            {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = activeItem === item.id
              return (
                <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <LocaleLink
                        href={item.href}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {!collapsed && <span>{t(item.labelKey)}</span>}
                      </LocaleLink>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="text-xs">
                        {t(item.labelKey)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-2">
          {/* Plan badge：仅在用户端显示 */}
          {!isSuperadminView && !collapsed && (
            <div className="mb-2 rounded-md bg-sidebar-accent px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("dashboard.currentPlan")}</span>
                {planLoading ? (
                  <div className="h-3 w-8 animate-pulse rounded bg-border" />
                ) : (
                  <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary border-0">
                    {planInfo?.planName || t("dashboard.planDefault")}
                  </Badge>
                )}
              </div>
              {planLoading ? (
                <>
                  <div className="mt-1 h-3 w-24 animate-pulse rounded bg-border" />
                  <div className="mt-1.5 h-1 rounded-full bg-border" />
                </>
              ) : planInfo && planInfo.totalAmount > 0 ? (
                <>
                  <p className="mt-1 text-xs text-sidebar-foreground font-medium">
                    ¥{planInfo.usedAmount.toFixed(2)} / ¥{planInfo.totalAmount.toFixed(2)}
                  </p>
                  <div className="mt-1.5 h-1 rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min((planInfo.usedAmount / planInfo.totalAmount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-xs text-sidebar-foreground font-medium">
                    {t("dashboard.balance")}: ¥{planInfo?.balance.toFixed(2) || '0.00'}
                  </p>
                  <div className="mt-1.5 h-1 rounded-full bg-border">
                    <div className="h-full w-0 rounded-full bg-primary" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* User */}
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-sidebar-foreground">
                    {userPhone || t("dashboard.notLoggedIn")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {userPhone || "—"}
                  </p>
                </div>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleLogout}
                  aria-label={t("dashboard.logout")}
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </aside>
    </TooltipProvider>
  )
}
