import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * GET /api/settings/login-history - 获取最近登录记录
 */
export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const logs = await prisma.userLoginLog.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
      take: 20,
      select: {
        id: true,
        email: true,
        loginAt: true,
        ipAddress: true,
        userAgent: true,
      },
    })

    return NextResponse.json({
      ok: true,
      data: logs.map(log => ({
        id: String(log.id),
        email: log.email,
        login_at: log.loginAt.toISOString(),
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch login history:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
