import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

function getCurrentUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request)
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30', 10)
  const model = searchParams.get('model') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
  const status = searchParams.get('status') || undefined
  const section = searchParams.get('section') || 'all' // all | overview | trend | models | logs | tokens | savings

  if (days < 1 || days > 365) {
    return NextResponse.json(
      { error: { message: 'Invalid days parameter', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json(
      { error: { message: 'Please login', type: 'authentication_error' } },
      { status: 401 }
    )
  }

  try {
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - days)
    // 上一周期
    const prevStartDate = new Date()
    prevStartDate.setDate(startDate.getDate() - days)

    const whereClause: Record<string, unknown> = {
      userId,
      createdAt: { gte: startDate },
    }
    if (model) whereClause.model = model
    if (status) whereClause.status = status

    const prevWhereClause: Record<string, unknown> = {
      userId,
      createdAt: { gte: prevStartDate, lt: startDate },
    }
    if (model) prevWhereClause.model = model

    const result: Record<string, unknown> = {}

    // ==================== 概览统计（带环比） ====================
    if (section === 'all' || section === 'overview') {
      const [currentLogs, prevLogs] = await Promise.all([
        prisma.usageLog.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } }),
        prisma.usageLog.findMany({ where: prevWhereClause }),
      ])

      const calcSummary = (logs: typeof currentLogs) => {
        let inputTokens = 0, outputTokens = 0, cost = 0, latencySum = 0, latencyCount = 0, successCount = 0, savedCost = 0
        for (const log of logs) {
          inputTokens += log.inputTokens
          outputTokens += log.outputTokens
          cost += Number(log.cost)
          savedCost += Number(log.saved_cost || 0)
          if (log.status === 'success') successCount++
          if (typeof log.latencyMs === 'number') { latencySum += log.latencyMs; latencyCount++ }
        }
        return {
          total_requests: logs.length,
          total_input_tokens: inputTokens,
          total_output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
          total_cost: cost,
          total_saved_cost: savedCost,
          avg_latency_ms: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
          success_rate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
        }
      }

      const current = calcSummary(currentLogs)
      const prev = calcSummary(prevLogs)

      const calcChange = (cur: number, pre: number) => {
        if (pre === 0) return cur > 0 ? 100 : 0
        return ((cur - pre) / pre) * 100
      }

      result.overview = {
        current,
        previous: prev,
        changes: {
          requests: calcChange(current.total_requests, prev.total_requests),
          tokens: calcChange(current.total_tokens, prev.total_tokens),
          cost: calcChange(current.total_cost, prev.total_cost),
          latency: calcChange(current.avg_latency_ms, prev.avg_latency_ms),
          success_rate: current.success_rate - prev.success_rate,
          saved_cost: calcChange(current.total_saved_cost, prev.total_saved_cost),
        },
      }
    }

    // ==================== 每日趋势 ====================
    if (section === 'all' || section === 'trend') {
      const [currentLogs, prevLogs] = await Promise.all([
        prisma.usageLog.findMany({ where: whereClause, orderBy: { createdAt: 'asc' } }),
        prisma.usageLog.findMany({ where: prevWhereClause, orderBy: { createdAt: 'asc' } }),
      ])

      const buildDailyMap = (logs: typeof currentLogs) => {
        const daily: Record<string, { requests: number; tokens: number; cost: number; input_tokens: number; output_tokens: number }> = {}
        for (const log of logs) {
          const dateKey = log.createdAt.toISOString().split('T')[0]
          if (!daily[dateKey]) daily[dateKey] = { requests: 0, tokens: 0, cost: 0, input_tokens: 0, output_tokens: 0 }
          daily[dateKey].requests++
          daily[dateKey].tokens += log.inputTokens + log.outputTokens
          daily[dateKey].cost += Number(log.cost)
          daily[dateKey].input_tokens += log.inputTokens
          daily[dateKey].output_tokens += log.outputTokens
        }
        return daily
      }

      result.trend = {
        current: buildDailyMap(currentLogs),
        previous: buildDailyMap(prevLogs),
      }
    }

    // ==================== 模型排行 ====================
    if (section === 'all' || section === 'models') {
      const logs = await prisma.usageLog.findMany({ where: whereClause })
      const modelMap: Record<string, { requests: number; tokens: number; cost: number; latency_sum: number; latency_count: number; input_tokens: number; output_tokens: number; saved_cost: number }> = {}
      for (const log of logs) {
        const key = log.model
        if (!modelMap[key]) modelMap[key] = { requests: 0, tokens: 0, cost: 0, latency_sum: 0, latency_count: 0, input_tokens: 0, output_tokens: 0, saved_cost: 0 }
        modelMap[key].requests++
        modelMap[key].tokens += log.inputTokens + log.outputTokens
        modelMap[key].cost += Number(log.cost)
        modelMap[key].input_tokens += log.inputTokens
        modelMap[key].output_tokens += log.outputTokens
        modelMap[key].saved_cost += Number(log.saved_cost || 0)
        if (typeof log.latencyMs === 'number') {
          modelMap[key].latency_sum += log.latencyMs
          modelMap[key].latency_count++
        }
      }

      const totalRequests = logs.length
      const models = Object.entries(modelMap).map(([name, data]) => ({
        name,
        requests: data.requests,
        tokens: data.tokens,
        input_tokens: data.input_tokens,
        output_tokens: data.output_tokens,
        cost: data.cost,
        saved_cost: data.saved_cost,
        avg_latency: data.latency_count > 0 ? Math.round(data.latency_sum / data.latency_count) : 0,
        percentage: totalRequests > 0 ? (data.requests / totalRequests) * 100 : 0,
      })).sort((a, b) => b.requests - a.requests)

      result.models = models
    }

    // ==================== 请求日志明细（分页） ====================
    if (section === 'all' || section === 'logs') {
      const [total, logs] = await Promise.all([
        prisma.usageLog.count({ where: whereClause }),
        prisma.usageLog.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            model: true,
            requestedModel: true,
            provider: true,
            inputTokens: true,
            outputTokens: true,
            totalTokens: true,
            cost: true,
            latencyMs: true,
            status: true,
            createdAt: true,
            saved_cost: true,
          },
        }),
      ])

      result.logs = {
        items: logs.map(log => ({
          id: String(log.id),
          model: log.model,
          requested_model: log.requestedModel,
          provider: log.provider,
          input_tokens: log.inputTokens,
          output_tokens: log.outputTokens,
          total_tokens: log.totalTokens,
          cost: Number(log.cost),
          saved_cost: Number(log.saved_cost || 0),
          latency_ms: log.latencyMs,
          status: log.status,
          created_at: log.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }

    // ==================== Token 消耗分析 ====================
    if (section === 'all' || section === 'tokens') {
      const logs = await prisma.usageLog.findMany({ where: whereClause, orderBy: { createdAt: 'asc' } })
      const daily: Record<string, { input: number; output: number; cost: number }> = {}
      for (const log of logs) {
        const dateKey = log.createdAt.toISOString().split('T')[0]
        if (!daily[dateKey]) daily[dateKey] = { input: 0, output: 0, cost: 0 }
        daily[dateKey].input += log.inputTokens
        daily[dateKey].output += log.outputTokens
        daily[dateKey].cost += Number(log.cost)
      }
      result.tokens = daily
    }

    // ==================== 智能路由节省 ====================
    if (section === 'all' || section === 'savings') {
      const logs = await prisma.usageLog.findMany({
        where: { ...whereClause },
        select: {
          model: true,
          requestedModel: true,
          cost: true,
          saved_cost: true,
          createdAt: true,
        },
      })

      let totalSaved = 0
      let routedCount = 0
      const dailySaved: Record<string, number> = {}

      for (const log of logs) {
        const saved = Number(log.saved_cost || 0)
        totalSaved += saved
        if (log.requestedModel && log.requestedModel !== log.model) {
          routedCount++
        }
        const dateKey = log.createdAt.toISOString().split('T')[0]
        dailySaved[dateKey] = (dailySaved[dateKey] || 0) + saved
      }

      result.savings = {
        total_saved: totalSaved,
        routed_requests: routedCount,
        total_requests: logs.length,
        route_rate: logs.length > 0 ? (routedCount / logs.length) * 100 : 0,
        daily: dailySaved,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch analytics', type: 'internal_error' } },
      { status: 500 }
    )
  }
}
