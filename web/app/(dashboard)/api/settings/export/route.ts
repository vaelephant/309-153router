import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * GET /api/settings/export - 导出用量数据为 CSV
 */
export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30', 10)
  const type = searchParams.get('type') || 'usage' // usage | transactions

  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    if (type === 'transactions') {
      const transactions = await prisma.transaction.findMany({
        where: { userId, createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
      })

      const csvHeader = '时间,类型,金额,描述\n'
      const csvBody = transactions.map(t => {
        const time = t.createdAt.toISOString()
        const typeLabel = { recharge: '充值', usage: '消费', refund: '退款', adjustment: '调整' }[t.type] || t.type
        return `${time},${typeLabel},${Number(t.amount).toFixed(4)},${(t.description || '').replace(/,/g, '，')}`
      }).join('\n')

      return new NextResponse(csvHeader + csvBody, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="transactions_${days}d.csv"`,
        },
      })
    }

    // 默认导出用量数据
    const usageLogs = await prisma.usageLog.findMany({
      where: { userId, createdAt: { gte: startDate } },
      orderBy: { createdAt: 'desc' },
    })

    const csvHeader = '时间,模型,请求模型,供应商,输入Token,输出Token,总Token,费用,节省,延迟(ms),状态\n'
    const csvBody = usageLogs.map(log => {
      return [
        log.createdAt.toISOString(),
        log.model,
        log.requestedModel || '',
        log.provider || '',
        log.inputTokens,
        log.outputTokens,
        log.totalTokens,
        Number(log.cost).toFixed(6),
        Number(log.saved_cost || 0).toFixed(6),
        log.latencyMs ?? '',
        log.status,
      ].join(',')
    }).join('\n')

    return new NextResponse(csvHeader + csvBody, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="usage_${days}d.csv"`,
      },
    })
  } catch (error) {
    console.error('Failed to export data:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
