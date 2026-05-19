/**
 * API 密钥模块数据访问层
 */
import { prisma } from '@/lib/db'

/**
 * 获取用户的 API Keys
 */
export async function getUserApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      rateLimitPerMin: true,
      monthlyRequestQuota: true,
      allowedModels: true,
      createdAt: true,
      lastUsedAt: true,
    },
  })
}

/**
 * 查找 API Key（用于验证是否存在）
 */
export async function findApiKeyById(keyId: string, userId: string) {
  return prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  })
}

/**
 * 统计各 API Key 在指定时间后的请求次数
 */
export async function countRequestsByApiKeysSince(
  userId: string,
  keyIds: string[],
  since: Date
): Promise<Record<string, number>> {
  if (keyIds.length === 0) return {}

  const rows = await prisma.usageLog.groupBy({
    by: ['apiKeyId'],
    where: {
      userId,
      apiKeyId: { in: keyIds },
      createdAt: { gte: since },
    },
    _count: { id: true },
  })

  const map: Record<string, number> = {}
  for (const row of rows) {
    if (row.apiKeyId) {
      map[row.apiKeyId] = row._count.id
    }
  }
  return map
}
