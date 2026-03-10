"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Receipt, Loader2 } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"

const exportOptions = [
  {
    id: "usage",
    label: "用量数据",
    description: "包含 API 调用记录：模型、Token 数、费用、延迟等",
    icon: FileSpreadsheet,
  },
  {
    id: "transactions",
    label: "收支流水",
    description: "包含充值、消费、退款等所有交易记录",
    icon: Receipt,
  },
]

const dayOptions = [
  { label: "近 7 天", value: 7 },
  { label: "近 30 天", value: 30 },
  { label: "近 90 天", value: 90 },
  { label: "近 365 天", value: 365 },
]

export function SettingsDataExport() {
  const [exportType, setExportType] = useState("usage")
  const [exportDays, setExportDays] = useState(30)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    const userId = getCurrentUserId()
    if (!userId) return

    setExporting(true)
    try {
      const res = await fetch(
        `/api/settings/export?type=${exportType}&days=${exportDays}`,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Download className="size-4" />
          数据导出
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* 导出类型 */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">选择导出类型</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exportOptions.map((option) => (
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
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 时间范围 */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">时间范围</label>
            <div className="flex items-center gap-2">
              {dayOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={exportDays === opt.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  style={exportDays === opt.value ? { backgroundColor: "#003153", color: "#fff" } : undefined}
                  onClick={() => setExportDays(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 导出按钮 */}
          <Button
            className="h-9 px-6 text-white"
            style={{ backgroundColor: "#003153" }}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="size-4 mr-2" />
                导出 CSV
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground">
            导出文件格式为 CSV，可用 Excel 或 Google Sheets 打开。数据量较大时导出可能需要几秒钟。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
