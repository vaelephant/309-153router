"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Plus } from "lucide-react"
import { format } from "date-fns"
import { useI18n } from "@/lib/i18n-context"

interface InviteCode {
  id: number
  code: string
  used_count: number
  max_uses: number | null
  remaining_uses: number | null
  is_expired: boolean
  is_used_up: boolean
  created_at: string | null
}

interface InviteCodeListProps {
  codes: InviteCode[]
  loading: boolean
  onGenerate: () => void
}

export function InviteCodeList({ codes, loading, onGenerate }: InviteCodeListProps) {
  const { t, locale } = useI18n()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopyCode = (code: string) => {
    const url = `${window.location.origin}/${locale}/register?invite_code=${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("invite.myCodes")}</CardTitle>
            <CardDescription>{t("invite.myCodesDesc")}</CardDescription>
          </div>
          <Button onClick={onGenerate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("invite.generateCode")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t("invite.loading")}</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("invite.noCodes")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => {
              const inviteUrl = `${window.location.origin}/${locale}/register?invite_code=${code.code}`
              const isAvailable = !code.is_expired && !code.is_used_up
              const remainingText = code.remaining_uses === null ? t("invite.unlimited") : `${code.remaining_uses}${t("invite.times")}`
              const createdDate = code.created_at ? format(new Date(code.created_at), 'yyyy-MM-dd') : ''
              
              return (
                <div
                  key={code.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  {/* 第一行：邀请码和状态 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-mono font-semibold text-lg">{code.code}</div>
                      {isAvailable && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded">
                          {t("invite.available")}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 第二行：使用统计和创建日期 */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      {t("invite.used")}: {code.used_count}
                      {code.max_uses !== null && `/${code.max_uses}`}
                      {' '}
                      {t("invite.remaining")}: {remainingText}
                    </div>
                    {createdDate && (
                      <div>{t("invite.created")}: {createdDate}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("invite.registerLink")}:</span>
                    <a 
                      href={inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex-1 truncate"
                    >
                      {inviteUrl}
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(code.code)}
                      className="shrink-0"
                    >
                      {copiedCode === code.code ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {t("common.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          {t("invite.copy")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
