/**
 * Superadmin 概览 API
 * GET /api/superadmin/overview
 */
import { NextRequest, NextResponse } from 'next/server'
import { fetchSuperadminOverview } from '@/app/(superadmin)/domain/superadmin.service'
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
    const data = await fetchSuperadminOverview()
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Superadmin overview error:', error)
    return NextResponse.json(
      {
        success: false,
        detail: error instanceof Error ? error.message : '获取概览失败',
      },
      { status: 500 }
    )
  }
}
