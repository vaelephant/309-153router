import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/models
 * 从数据库读取已启用的模型列表及定价信息
 */
export async function GET() {
  try {
    const models = await prisma.modelPricing.findMany({
      where: { enabled: true },
      orderBy: [{ provider: 'asc' }, { modelName: 'asc' }],
      select: {
        modelName: true,
        inputPrice: true,
        outputPrice: true,
        provider: true,
        maxTokens: true,
        description: true,
        enabled: true,
      },
    })

    // 转换为前端需要的格式
    const result = models.map((m) => ({
      name: m.modelName,
      provider: m.provider,
      inputPrice: Number(m.inputPrice),
      outputPrice: Number(m.outputPrice),
      maxTokens: m.maxTokens,
      description: m.description,
      enabled: m.enabled,
    }))

    return NextResponse.json({ models: result })
  } catch (error) {
    console.error('[API /api/models] Database error:', error)
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Internal server error', type: 'db_error' } },
      { status: 500 }
    )
  }
}
