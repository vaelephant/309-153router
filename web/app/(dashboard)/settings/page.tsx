"use client"

import { useState } from "react"
import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { SettingsProfile } from "../components/settings-profile"
import { SettingsSecurity } from "../components/settings-security"
// import { SettingsNotifications } from "../components/settings-notifications"  // 通知偏好 - 暂时关闭，后续启用
import { SettingsApiPreferences } from "../components/settings-api-preferences"
import { SettingsDataExport } from "../components/settings-data-export"
import { User, Shield, Bell, Server, Download } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "profile", label: "个人信息", icon: User },
  { id: "security", label: "安全设置", icon: Shield },
  // { id: "notifications", label: "通知偏好", icon: Bell },  // 暂时关闭，后续启用
  { id: "api", label: "API 偏好", icon: Server },
  { id: "export", label: "数据导出", icon: Download },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">设置</h1>
            <p className="text-xs text-muted-foreground">
              账户设置和偏好配置
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧 Tab 导航 */}
            <nav className="lg:w-48 shrink-0">
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
                      activeTab === tab.id
                        ? "bg-[--color-brand]/10 text-[--color-brand] font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* 右侧内容区域 */}
            <div className="flex-1 min-w-0">
              {activeTab === "profile" && <SettingsProfile />}
              {activeTab === "security" && <SettingsSecurity />}
              {/* {activeTab === "notifications" && <SettingsNotifications />} */}{/* 暂时关闭 */}
              {activeTab === "api" && <SettingsApiPreferences />}
              {activeTab === "export" && <SettingsDataExport />}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
