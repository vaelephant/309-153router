"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Monitor, Globe, Clock, Eye, EyeOff } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"

interface LoginRecord {
  id: string
  email: string
  login_at: string
  ip_address: string | null
  user_agent: string | null
}

function parseUA(ua: string | null): string {
  if (!ua) return "未知设备"
  if (ua.includes("Windows")) return "Windows"
  if (ua.includes("Mac")) return "macOS"
  if (ua.includes("Linux")) return "Linux"
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS"
  if (ua.includes("Android")) return "Android"
  return "其他"
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SettingsSecurity() {
  // 修改密码
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changing, setChanging] = useState(false)
  const [changeMsg, setChangeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 登录记录
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const userId = getCurrentUserId()
      if (!userId) { setHistoryLoading(false); return }

      try {
        const res = await fetch("/api/settings/login-history", {
          headers: { "x-user-id": userId },
        })
        const json = await res.json()
        if (json.ok) setLoginHistory(json.data)
      } catch (error) {
        console.error("Failed to fetch login history:", error)
      } finally {
        setHistoryLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleChangePassword = async () => {
    setChangeMsg(null)

    if (!oldPassword || !newPassword) {
      setChangeMsg({ type: "error", text: "请填写完整" })
      return
    }
    if (newPassword.length < 6) {
      setChangeMsg({ type: "error", text: "新密码长度不能少于6位" })
      return
    }

    const userId = getCurrentUserId()
    if (!userId) return

    setChanging(true)
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        setChangeMsg({ type: "success", text: "密码修改成功" })
        setOldPassword("")
        setNewPassword("")
      } else {
        setChangeMsg({ type: "error", text: json.error || "修改失败" })
      }
    } catch {
      setChangeMsg({ type: "error", text: "网络异常，请重试" })
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lock className="size-4" />
            修改密码
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">当前密码</label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm pr-9"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="输入当前密码"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowOld(!showOld)}
                >
                  {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">新密码</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm pr-9"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入新密码（至少6位）"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            {changeMsg && (
              <p className={`text-xs ${changeMsg.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
                {changeMsg.text}
              </p>
            )}

            <Button
              className="h-9 px-6 text-white"
              style={{ backgroundColor: "#003153" }}
              onClick={handleChangePassword}
              disabled={changing}
            >
              {changing ? "修改中..." : "确认修改"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 登录记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Monitor className="size-4" />
            最近登录记录
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              暂无登录记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">时间</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">IP 地址</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">设备</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((record, i) => (
                    <tr key={record.id} className={i !== loginHistory.length - 1 ? "border-b border-border" : ""}>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span>{formatTime(record.login_at)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <Globe className="size-3.5 text-muted-foreground" />
                          <span>{record.ip_address || "未知"}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="size-3.5 text-muted-foreground" />
                          <span>{parseUA(record.user_agent)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
