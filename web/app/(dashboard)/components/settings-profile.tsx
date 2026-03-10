"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar, Wallet, Key, Copy, Check } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"

interface ProfileData {
  id: string
  email: string
  role: string
  created_at: string
  balance: number
  active_api_keys: number
}

const roleLabels: Record<string, string> = {
  superadmin: "超级管理员",
  admin: "管理员",
  user: "普通用户",
  enterprise: "企业用户",
}

export function SettingsProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const userId = getCurrentUserId()
      if (!userId) { setLoading(false); return }

      try {
        const res = await fetch("/api/settings/profile", {
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
  }, [])

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
          <CardTitle className="text-sm font-medium">个人信息</CardTitle>
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
          <CardTitle className="text-sm font-medium">个人信息</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">无法加载个人信息</p>
        </CardContent>
      </Card>
    )
  }

  const items = [
    {
      icon: User,
      label: "用户 ID",
      value: (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
            {profile.id.slice(0, 8)}...{profile.id.slice(-4)}
          </code>
          <button
            onClick={handleCopyId}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="复制完整 ID"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      ),
    },
    {
      icon: Mail,
      label: "邮箱",
      value: <span className="text-sm">{profile.email}</span>,
    },
    {
      icon: Shield,
      label: "角色",
      value: (
        <Badge
          variant="outline"
          className={`text-xs ${
            profile.role === "superadmin"
              ? "border-amber-300 text-amber-700 bg-amber-50"
              : "border-border"
          }`}
        >
          {roleLabels[profile.role] || profile.role}
        </Badge>
      ),
    },
    {
      icon: Calendar,
      label: "注册时间",
      value: (
        <span className="text-sm">
          {new Date(profile.created_at).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      icon: Wallet,
      label: "当前余额",
      value: <span className="text-sm font-medium">¥{profile.balance.toFixed(2)}</span>,
    },
    {
      icon: Key,
      label: "活跃 API Key",
      value: <span className="text-sm font-medium">{profile.active_api_keys} 个</span>,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">个人信息</CardTitle>
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
