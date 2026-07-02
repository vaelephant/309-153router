import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { getPaymentMethodsForUser } from '@/app/[locale]/(billing)/domain/billing.service'

/**
 * GET /api/billing/payment-methods
 */
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ ok: false, error: '请先登录' }, { status: 401 })
  }

  try {
    const items = await getPaymentMethodsForUser(userId)
    return NextResponse.json({ ok: true, data: { items } })
  } catch (error) {
    console.error('获取支付方式失败:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : '获取支付方式失败',
      },
      { status: 500 }
    )
  }
}
