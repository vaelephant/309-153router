"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from "../../(dashboard)/components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { InviteStatsCards } from "../components/invite-stats-cards"
import { InviteChart } from "../components/invite-chart"
import { InviteCodeUsagePie } from "../components/invite-code-usage-pie"
import { InviteTimeDistributionPie } from "../components/invite-time-distribution-pie"
import { InviteCodeList } from "../components/invite-code-list"
import { InviteUserList } from "../components/invite-user-list"
import { useI18n } from "@/lib/i18n-context"
import { 
  generateInviteCode, 
  getMyInviteCodes, 
  getMyInvites, 
  getInviteStats,
} from "@/lib/api/invite"
import { getCurrentUserId } from "@/lib/auth-client"

export default function InvitePage() {
  const { t, locale } = useI18n()
  const [inviteCodes, setInviteCodes] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [locale])

  const fetchData = async () => {
    const userId = getCurrentUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const [inviteCodes, invites, statsRes] = await Promise.all([
        getMyInviteCodes(locale),
        getMyInvites(locale),
        getInviteStats(locale),
      ])

      // 直接使用数组，不需要检查 success
      setInviteCodes(inviteCodes || [])
      setInvites(invites || [])
      console.log('[invite page] inviteCodes:', inviteCodes)
      console.log('[invite page] invites:', invites)
      
      if (statsRes.success) {
        setStats(statsRes.stats)
      }
    } catch (error) {
      console.error('获取邀请数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCode = async () => {
    try {
      // 默认生成无限次邀请码
      const result = await generateInviteCode(999999, null, locale)
      if (result.success) {
        await fetchData()
      }
    } catch (error) {
      console.error('生成邀请码失败:', error)
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t("invite.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("invite.subtitle")}
            </p>
          </div>

          {/* 统计卡片 */}
          <InviteStatsCards stats={stats} />

          {/* 邀请用户趋势曲线图 */}
          <InviteChart />

          {/* 两个饼图：邀请码邀请数量 + 邀请用户注册时间分布 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InviteCodeUsagePie codes={inviteCodes} loading={loading} />
            <InviteTimeDistributionPie invites={invites} loading={loading} />
          </div>

          {/* 我的邀请码 */}
          <InviteCodeList
            codes={inviteCodes}
            loading={loading}
            onGenerate={handleGenerateCode}
          />

          {/* 我的邀请 */}
          <InviteUserList
            invites={invites}
            loading={loading}
          />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
