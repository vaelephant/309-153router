"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Receipt, Loader2 } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

const exportOptionIds = [
  { id: "usage", icon: FileSpreadsheet },
  { id: "transactions", icon: Receipt },
] as const

const dayValues = [7, 30, 90, 365] as const

export function SettingsDataExport() {
  const { t, locale } = useI18n()
  const [exportType, setExportType] = useState<"usage" | "transactions">("usage")
  const [exportDays, setExportDays] = useState(30)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    const userId = getCurrentUserId()
    if (!userId) return

    setExporting(true)
    try {
      const res = await fetch(
        `/${locale}/api/settings/export?type=${exportType}&days=${exportDays}`,
        { headers: { "x-user-id": userId } }
      )

      if (!res.ok) {
        console.error("Export failed:", res.statusText)
        return
      }

      // 下载文件
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${exportType}_${exportDays}d.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  const exportLabels: Record<string, { label: string; desc: string }> = {
    usage: { label: t("dataExport.usageData"), desc: t("dataExport.usageDataDesc") },
    transactions: { label: t("dataExport.transactions"), desc: t("dataExport.transactionsDesc") },
  }
  const dayLabels: Record<number, string> = {
    7: t("dataExport.days7"),
    30: t("dataExport.days30"),
    90: t("dataExport.days90"),
    365: t("dataExport.days365"),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Download className="size-4" />
          {t("dataExport.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{t("dataExport.selectType")}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exportOptionIds.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setExportType(option.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-colors ${
                    exportType === option.id
                      ? "border-[#003153] bg-[#003153]/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className="flex size-8 items-center justify-center rounded-md shrink-0"
                    style={exportType === option.id ? { backgroundColor: "rgba(0,49,83,0.15)" } : undefined}
                  >
                    <option.icon
                      className="size-4"
                      style={exportType === option.id ? { color: "#003153" } : { color: "#9ca3af" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exportLabels[option.id].label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{exportLabels[option.id].desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{t("dataExport.timeRange")}</label>
            <div className="flex items-center gap-2">
              {dayValues.map((value) => (
                <Button
                  key={value}
                  variant={exportDays === value ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  style={exportDays === value ? { backgroundColor: "#003153", color: "#fff" } : undefined}
                  onClick={() => setExportDays(value)}
                >
                  {dayLabels[value]}
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="h-9 px-6 text-white"
            style={{ backgroundColor: "#003153" }}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {t("dataExport.exporting")}
              </>
            ) : (
              <>
                <Download className="size-4 mr-2" />
                {t("dataExport.exportCsv")}
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground">
            {t("dataExport.footerHint")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
