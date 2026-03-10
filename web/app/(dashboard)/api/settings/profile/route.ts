import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * GET /api/settings/profile - 获取用户个人信息
 */
export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const balance = await prisma.userBalance.findUnique({
      where: { userId },
    })

    const apiKeyCount = await prisma.apiKey.count({
      where: { userId, status: 'active' },
    })

    return NextResponse.json({
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.createdAt.toISOString(),
        balance: balance ? Number(balance.balance) : 0,
        active_api_keys: apiKeyCount,
      },
    })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
