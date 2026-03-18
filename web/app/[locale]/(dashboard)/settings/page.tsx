"use client"

import { useState } from "react"
import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { SettingsProfile } from "../components/settings-profile"
import { SettingsSecurity } from "../components/settings-security"
import { SettingsApiPreferences } from "../components/settings-api-preferences"
import { SettingsDataExport } from "../components/settings-data-export"
import { User, Shield, Server, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("profile")
  const tabs = [
    { id: "profile", labelKey: "dashboard.profile", icon: User },
    { id: "security", labelKey: "dashboard.security", icon: Shield },
    { id: "api", labelKey: "dashboard.apiPrefs", icon: Server },
    { id: "export", labelKey: "dashboard.dataExport", icon: Download },
  ]

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">{t("dashboard.settingsTitle")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.settingsDesc")}
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
                    {t(tab.labelKey)}
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
