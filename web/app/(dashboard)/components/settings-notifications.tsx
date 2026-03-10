"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Wallet, AlertTriangle, Mail } from "lucide-react"

interface NotificationSetting {
  id: string
  label: string
  description: string
  icon: React.ElementType
  enabled: boolean
}

export function SettingsNotifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "balance_low",
      label: "余额不足提醒",
      description: "当余额低于指定阈值时发送邮件提醒",
      icon: Wallet,
      enabled: false,
    },
    {
      id: "api_error",
      label: "API 异常报警",
      description: "当 API 调用连续失败时发送通知",
      icon: AlertTriangle,
      enabled: false,
    },
    {
      id: "monthly_report",
      label: "月度用量报告",
      description: "每月初自动发送上月的用量分析报告",
      icon: Mail,
      enabled: false,
    },
    {
      id: "recharge_success",
      label: "充值到账通知",
      description: "充值成功后发送确认通知",
      icon: Bell,
      enabled: true,
    },
  ])

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="size-4" />
            通知偏好
          </CardTitle>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            部分功能即将上线
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <setting.icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  setting.enabled ? "bg-[--color-brand]" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                    setting.enabled ? "translate-x-[18px]" : "translate-x-[3px]"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* 余额阈值设置 */}
        <div className="mt-4 pt-4 border-t border-border">
          <label className="text-xs text-muted-foreground mb-2 block">余额提醒阈值</label>
          <div className="flex items-center gap-2 max-w-xs">
            <span className="text-sm text-muted-foreground">¥</span>
            <input
              type="number"
              className="w-24 h-8 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={10}
              min={1}
              step={1}
            />
            <span className="text-xs text-muted-foreground">余额低于此值时触发提醒</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
