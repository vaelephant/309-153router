import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { createSetupIntentForUser } from '@/app/[locale]/(billing)/domain/billing.service'

/**
 * 创建绑卡 SetupIntent
 * POST /api/billing/setup-intent
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ ok: false, error: '请先登录' }, { status: 401 })
  }

  try {
    const result = await createSetupIntentForUser(userId)
    return NextResponse.json({
      ok: true,
      data: {
        clientSecret: result.clientSecret,
        setupIntentId: result.setupIntentId,
        customerId: result.customerId,
      },
    })
  } catch (error) {
    console.error('创建 SetupIntent 失败:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : '创建绑卡会话失败',
      },
      { status: 500 }
    )
  }
}
