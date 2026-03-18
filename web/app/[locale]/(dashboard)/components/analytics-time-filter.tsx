"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

const presets = [
  { label: "7天", value: 7 },
  { label: "30天", value: 30 },
  { label: "90天", value: 90 },
]

interface AnalyticsTimeFilterProps {
  days: number
  onChange: (days: number) => void
}

export function AnalyticsTimeFilter({ days, onChange }: AnalyticsTimeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="size-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground mr-1">时间范围：</span>
      {presets.map((preset) => (
        <Button
          key={preset.value}
          variant={days === preset.value ? "default" : "outline"}
          size="sm"
          className="h-7 px-3 text-xs"
          style={days === preset.value ? { backgroundColor: "#003153", color: "#fff" } : undefined}
          onClick={() => onChange(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
