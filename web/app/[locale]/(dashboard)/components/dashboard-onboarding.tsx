"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KeyRound, FlaskConical, BookOpen, ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { LocaleLink } from "@/components/locale-link"
import { getCurrentUserId } from "@/lib/auth-client"

interface OnboardingState {
  show: boolean
  hasKeys: boolean
}

export function DashboardOnboarding() {
  const { t, locale } = useI18n()
  const [state, setState] = useState<OnboardingState>({ show: false, hasKeys: false })

  useEffect(() => {
    async function load() {
      const userId = getCurrentUserId()
      if (!userId) return

      try {
        const [usageRes, keysRes] = await Promise.all([
          fetch(`/${locale}/api/usage?days=30`, { headers: { "x-user-id": userId } }),
          fetch(`/${locale}/api/keys`, { headers: { "x-user-id": userId } }),
        ])
        const usage = await usageRes.json()
        const keysJson = await keysRes.json()
        const keyList = keysJson.data || []
        const todayRequests = usage?.today?.total_requests ?? 0
        const periodRequests = usage?.summary?.total_requests ?? 0

        setState({
          show: todayRequests === 0 && periodRequests === 0,
          hasKeys: keyList.length > 0,
        })
      } catch {
        setState({ show: false, hasKeys: false })
      }
    }
    load()
  }, [locale])

  if (!state.show) return null

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold text-card-foreground mb-1">
          {t("dashboard.onboardingTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">{t("dashboard.onboardingDesc")}</p>
        <div className="flex flex-wrap gap-2">
          {!state.hasKeys && (
            <Button asChild size="sm" className="h-8 text-xs gap-1">
              <LocaleLink href="/keys">
                <KeyRound className="size-3.5" />
                {t("dashboard.onboardingCreateKey")}
                <ArrowRight className="size-3" />
              </LocaleLink>
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
            <LocaleLink href="/playground">
              <FlaskConical className="size-3.5" />
              {t("dashboard.tryPlayground")}
            </LocaleLink>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
            <LocaleLink href="/docs">
              <BookOpen className="size-3.5" />
              {t("dashboard.viewDocs")}
            </LocaleLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
