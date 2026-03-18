"use client"

import { Bell, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocaleLink } from "@/components/locale-link"
import { useI18n } from "@/lib/i18n-context"

export function TopBar() {
  const { t } = useI18n()
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3" />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:text-foreground active:bg-muted/30 active:text-foreground"
          asChild
        >
          <LocaleLink href="/docs">
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">{t("dashboard.apiDocs")}</span>
          </LocaleLink>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="relative size-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  )
}
