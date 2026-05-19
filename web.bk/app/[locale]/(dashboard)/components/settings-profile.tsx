"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Shield, Calendar, Wallet, Key, Copy, Check } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

interface ProfileData {
  id: string
  phone: string
  role: string
  created_at: string
  balance: number
  active_api_keys: number
}

const ROLE_KEYS: Record<string, string> = {
  superadmin: "dashboard.roleSuperadmin",
  admin: "dashboard.roleAdmin",
  user: "dashboard.roleUser",
  enterprise: "dashboard.roleEnterprise",
}

export function SettingsProfile() {
  const { t, locale } = useI18n()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const userId = getCurrentUserId()
      if (!userId) { setLoading(false); return }

      try {
        const res = await fetch(`/${locale}/api/settings/profile`, {
          headers: { "x-user-id": userId },
        })
        const json = await res.json()
        if (json.ok) setProfile(json.data)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [locale])

  const handleCopyId = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("dashboard.profileTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("dashboard.profileTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("dashboard.loadProfileError")}</p>
        </CardContent>
      </Card>
    )
  }

  const localeTag = locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US"
  const items = [
    {
      icon: User,
      label: t("dashboard.userId"),
      value: (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
            {profile.id.slice(0, 8)}...{profile.id.slice(-4)}
          </code>
          <button
            onClick={handleCopyId}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={t("dashboard.copyFullId")}
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      ),
    },
    {
      icon: Phone,
      label: t("dashboard.phone"),
      value: <span className="text-sm">{profile.phone}</span>,
    },
    {
      icon: Shield,
      label: t("dashboard.role"),
      value: (
        <Badge
          variant="outline"
          className={`text-xs ${
            profile.role === "superadmin"
              ? "border-amber-300 text-amber-700 bg-amber-50"
              : "border-border"
          }`}
        >
          {ROLE_KEYS[profile.role] ? t(ROLE_KEYS[profile.role]) : profile.role}
        </Badge>
      ),
    },
    {
      icon: Calendar,
      label: t("dashboard.registeredAt"),
      value: (
        <span className="text-sm">
          {new Date(profile.created_at).toLocaleDateString(localeTag, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      icon: Wallet,
      label: t("dashboard.currentBalanceLabel"),
      value: <span className="text-sm font-medium">¥{profile.balance.toFixed(2)}</span>,
    },
    {
      icon: Key,
      label: t("dashboard.activeKeysLabel"),
      value: <span className="text-sm font-medium">{t("dashboard.activeKeysCount", { count: String(profile.active_api_keys) })}</span>,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("dashboard.profileTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <item.icon className="size-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
