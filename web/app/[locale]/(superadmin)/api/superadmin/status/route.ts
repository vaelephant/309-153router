/**
 * 模型状态与响应时间
 * GET /api/superadmin/status?days=1
 */
import { NextRequest, NextResponse } from 'next/server'
import { fetchStatusOverview } from '@/app/(superadmin)/domain/superadmin.service'
import { verifySuperadmin } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  // 验证超级管理员权限
  const auth = await verifySuperadmin(request)
  if (!auth) {
    return NextResponse.json(
      {
        success: false,
        detail: '权限不足，仅超级管理员可访问',
      },
      { status: 403 }
    )
  }

  try {
    const days = Math.min(
      Math.max(parseInt(request.nextUrl.searchParams.get('days') || '1', 10), 1),
      30
    )
    const data = await fetchStatusOverview(days)
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Superadmin status error:', error)
    return NextResponse.json(
      {
        success: false,
        detail: error instanceof Error ? error.message : '获取状态失败',
      },
      { status: 500 }
    )
  }
}
