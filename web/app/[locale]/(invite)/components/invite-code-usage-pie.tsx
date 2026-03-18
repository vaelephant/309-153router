"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { useI18n } from "@/lib/i18n-context"

interface CodeItem {
  id: number
  code: string
  used_count: number
}

const COLORS = ["#003153", "#1a5276", "#2e86c1", "#5dade2", "#85c1e9", "#aed6f1", "#d4e6f1"]

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-popover-foreground">{payload[0].name}</p>
      <p className="text-xs text-muted-foreground">{payload[0].value}%</p>
    </div>
  )
}

interface InviteCodeUsagePieProps {
  codes: CodeItem[]
  loading?: boolean
}

export function InviteCodeUsagePie({ codes, loading }: InviteCodeUsagePieProps) {
  const { t } = useI18n()
  const total = codes.reduce((sum, c) => sum + (c.used_count || 0), 0)
  const items = codes
    .filter((c) => (c.used_count || 0) > 0)
    .map((c, i) => ({
      name: `${t("invite.codeLabel")} ${c.code}`,
      code: c.code,
      count: c.used_count,
      percentage: total > 0 ? Math.round((c.used_count / total) * 100) : 0,
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const pieData = items.map((m) => ({ name: m.name, value: m.percentage }))
  const colors = items.map((m) => m.color)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {t("invite.codeUsagePieTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            {t("invite.noData")}
          </div>
        ) : (
          <>
            <div className="mx-auto h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {items.map((item) => (
                <div key={item.code} className="flex items-center gap-3">
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: item.color }}
                  />
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="text-xs font-medium text-card-foreground truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-medium text-card-foreground tabular-nums shrink-0 ml-2">
                      {item.percentage}% · {item.count}{t("invite.peopleSuffix")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
