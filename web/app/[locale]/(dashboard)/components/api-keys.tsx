"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Plus, Trash2, Check } from "lucide-react"
import { getCurrentUserId } from "@/lib/auth-client"
import { useI18n } from "@/lib/i18n-context"

interface ApiKey {
  id: string
  masked_key: string
  status: string
  quota_limit: number
  quota_used: number
  created_at: string
  expires_at: string | null
}

export function ApiKeys() {
  const { t, locale } = useI18n()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    loadKeys()
  }, [locale])

  const loadKeys = async () => {
    const userId = getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/${locale}/api/keys`, {
        headers: { 'x-user-id': userId },
      })
      const data = await response.json()
      // 只显示活跃的 key，已撤销的不显示
      const activeKeys = (data.data || []).filter((k: ApiKey) => k.status === 'active')
      setKeys(activeKeys)
    } catch (error) {
      console.error('Failed to load keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    const userId = getCurrentUserId()
    if (!userId) {
      return
    }

    try {
      const response = await fetch(`/${locale}/api/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      })
      const data = await response.json()
      setNewKey(data.key)
      loadKeys()
    } catch (error) {
      console.error('Failed to create key:', error)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm(t("dashboard.revokeConfirm"))) {
      return
    }

    const userId = getCurrentUserId()
    if (!userId) {
      return
    }

    try {
      await fetch(`/${locale}/api/keys`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ key_id: keyId }),
      })
      loadKeys()
    } catch (error) {
      console.error('Failed to revoke key:', error)
    }
  }

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const maskKey = (key: string) => {
    return key.slice(0, 12) + "..." + key.slice(-4)
  }

  const localeTag = locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US"
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("dashboard.neverExpire")
    return new Date(dateString).toLocaleDateString(localeTag)
  }


  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {t("dashboard.apiKeysTitle")}
        </CardTitle>
        <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setShowCreateModal(true)}>
          <Plus className="size-3" />
          {t("dashboard.newKey")}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("dashboard.noKeysHint")}
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-card-foreground">
                      API Key
                    </span>
                    <Badge
                      variant={apiKey.status === "active" ? "secondary" : "outline"}
                      className={`text-[9px] px-1.5 py-0 ${
                        apiKey.status === "active"
                          ? "bg-success/15 text-success border-0"
                          : "text-muted-foreground"
                      }`}
                    >
                      {apiKey.status === "active" ? t("dashboard.active") : t("dashboard.revoked")}
                    </Badge>
                  </div>
                  <div className="mt-1">
                    <code className="text-[11px] font-mono text-muted-foreground">
                      {apiKey.masked_key}
                    </code>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{t("dashboard.createdAt")} {formatDate(apiKey.created_at)}</span>
                    <span>{t("dashboard.expiresAt")}: {formatDate(apiKey.expires_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {apiKey.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevokeKey(apiKey.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
            <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
              {newKey ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">{t("dashboard.keyCreatedTitle")}</h3>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-4">
                    <p className="text-sm text-yellow-500">
                      {t("dashboard.keyCreatedHint")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                      {newKey}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(newKey)
                        setCopiedKey('new')
                        setTimeout(() => setCopiedKey(null), 2000)
                      }}
                    >
                      {copiedKey === 'new' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewKey(null)
                    }}
                  >
                    {t("dashboard.done")}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">{t("dashboard.createKeyTitle")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("dashboard.createKeyDesc")}
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      {t("dashboard.cancel")}
                    </Button>
                    <Button onClick={handleCreateKey}>{t("dashboard.create")}</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
