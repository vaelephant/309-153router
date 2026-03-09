/**
 * Dashboard 可用模型列表 API
 * GET /api/dashboard/models
 * 返回启用的模型列表，包含定价、延迟、状态等信息
 */
import { NextResponse } from 'next/server'
import { getModelPricingList } from '@/app/(superadmin)/domain/superadmin.repo'
import { getModelList } from '@/lib/gateway'
import { getModelLatencyStats } from '@/app/(superadmin)/domain/superadmin.repo'

export async function GET() {
  try {
    // 并行获取数据
    const [pricingRows, gatewayResult, latencyStats] = await Promise.all([
      getModelPricingList(),
      getModelList(),
      getModelLatencyStats(7), // 最近7天的延迟统计
    ])

    // 只返回启用的模型
    const enabledPricing = pricingRows.filter((p) => p.enabled)

    const gatewayModels = 'models' in gatewayResult ? gatewayResult.models : []

    // 构建延迟和状态映射
    const latencyMap = new Map<string, number | null>()
    const statusMap = new Map<string, 'online' | 'degraded'>()

    for (const stat of latencyStats) {
      latencyMap.set(stat.model, stat.avgLatencyMs)
      // 根据成功率判断状态：成功率 > 90% 为 online，否则为 degraded
      const successRate = stat.requestCount > 0 
        ? stat.successCount / stat.requestCount 
        : 1
      statusMap.set(stat.model, successRate >= 0.9 ? 'online' : 'degraded')
    }

    // 格式化价格（从每1K tokens转换为每1M tokens，并格式化为美元）
    const formatPrice = (price: number | string | null) => {
      if (!price) return "$0.00"
      // price 是每1K tokens的价格，转换为每1M tokens需要乘以1000
      // Prisma Decimal 类型在 JS 中是字符串
      const pricePerM = Number(price) * 1000
      return `$${pricePerM.toFixed(2)}`
    }

    // 格式化上下文窗口
    const formatContext = (maxTokens: number | null) => {
      if (!maxTokens) return '—'
      if (maxTokens >= 1000000) return `${(maxTokens / 1000000).toFixed(0)}M`
      if (maxTokens >= 1000) return `${(maxTokens / 1000).toFixed(0)}K`
      return maxTokens.toString()
    }

    // 格式化延迟
    const formatLatency = (latencyMs: number | null) => {
      if (!latencyMs) return '—'
      return `~${latencyMs}ms`
    }

    // 构建返回数据
    const models = enabledPricing.map((pricing) => {
      const modelName = pricing.modelName
      const isInGateway = gatewayModels.includes(modelName)
      const avgLatency = latencyMap.get(modelName) ?? null
      
      // 如果不在gateway中，状态为degraded；否则使用统计数据
      let status: 'online' | 'degraded' = 'degraded'
      if (isInGateway) {
        status = statusMap.get(modelName) ?? 'online'
      }

      return {
        name: modelName,
        provider: pricing.providerRef?.name ?? pricing.provider,
        inputPrice: formatPrice(pricing.inputPrice),
        outputPrice: formatPrice(pricing.outputPrice),
        context: formatContext(pricing.maxTokens),
        latency: formatLatency(avgLatency),
        status,
      }
    })

    // 按模型名称排序
    models.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ success: true, data: models })
  } catch (error: unknown) {
    console.error('Dashboard models list error:', error)
    return NextResponse.json(
      {
        success: false,
        detail: error instanceof Error ? error.message : '获取模型列表失败',
      },
      { status: 500 }
    )
  }
}
