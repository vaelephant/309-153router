/**
 * Superadmin 模型用量统计 API
 * GET /api/superadmin/models/stats?days=7
 */
import { NextRequest, NextResponse } from 'next/server'
import { fetchModelStats } from '@/app/(superadmin)/domain/superadmin.service'
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
      Math.max(parseInt(request.nextUrl.searchParams.get('days') || '7', 10), 1),
      90
    )
    const data = await fetchModelStats(days)
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Superadmin model stats error:', error)
    return NextResponse.json(
      {
        success: false,
        detail: error instanceof Error ? error.message : '获取模型统计失败',
      },
      { status: 500 }
    )
  }
}
