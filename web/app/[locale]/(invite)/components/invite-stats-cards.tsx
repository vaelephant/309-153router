"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Gift } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

interface InviteStats {
  total_invites?: number
  total_rewards?: number
}

interface InviteStatsCardsProps {
  stats: InviteStats | null
}

export function InviteStatsCards({ stats }: InviteStatsCardsProps) {
  const { t } = useI18n()
  if (!stats) {
    return null
  }

  const cards = [
    {
      title: t("invite.statsTotalInvites"),
      value: `${stats.total_invites || 0}`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: t("invite.statsTotalRewards"),
      value: `¥${stats.total_rewards || 0}`,
      icon: Gift,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`rounded-md p-1.5 ${card.bg}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
