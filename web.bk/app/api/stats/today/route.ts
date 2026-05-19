/**
 * GET /api/stats/today
 * 当日请求数与处理 Token 总数（公开，无需鉴权）
 * 用于首页与 superadmin dashboard 顶部的今日统计展示
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const agg = await prisma.usageLog.aggregate({
      where: {
        createdAt: { gte: todayStart, lt: todayEnd },
      },
      _count: { id: true },
      _sum: { totalTokens: true },
    })

    const requests = Number(agg._count.id)
    const tokens = Number(agg._sum.totalTokens ?? 0)

    return NextResponse.json({
      ok: true,
      requests,
      tokens,
    })
  } catch (error) {
    console.error('[API /api/stats/today]', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
