/**
 * Superadmin 模型列表 API（含定价与用量统计）
 * GET /api/superadmin/models
 */
import { NextRequest, NextResponse } from 'next/server'
import { fetchModelsList } from '@/app/(superadmin)/domain/superadmin.service'
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
    const data = await fetchModelsList()
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Superadmin models list error:', error)
    return NextResponse.json(
      {
        success: false,
        detail: error instanceof Error ? error.message : '获取模型列表失败',
      },
      { status: 500 }
    )
  }
}
