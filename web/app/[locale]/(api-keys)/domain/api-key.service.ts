/**
 * API 密钥模块业务逻辑层
 */
import { getUserApiKeys, findApiKeyById, countRequestsByApiKeysSince } from './api-key.repo'
import { createApiKey, revokeApiKey } from '@/lib/auth'
import type { CreateApiKeyParams, CreateApiKeyResult, ApiKey } from './api-key.types'

/**
 * 获取用户的 API Keys 列表
 */
export async function fetchUserApiKeys(userId: string): Promise<ApiKey[]> {
  const apiKeys = await getUserApiKeys(userId)
  const keyIds = apiKeys.map((k) => k.id)

  const since30d = new Date()
  since30d.setDate(since30d.getDate() - 30)
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const [usageByKey, usageMonthByKey] = await Promise.all([
    countRequestsByApiKeysSince(userId, keyIds, since30d),
    countRequestsByApiKeysSince(userId, keyIds, monthStart),
  ])

  return apiKeys.map((key) => {
    const requests30d = usageByKey[key.id] ?? 0
    const requestsThisMonth = usageMonthByKey[key.id] ?? 0
    return {
      id: key.id,
      masked_key: `sk-${key.id.slice(0, 8)}...`,
      name: key.name,
      status: key.status,
      rate_limit_per_min: key.rateLimitPerMin,
      monthly_request_quota: key.monthlyRequestQuota,
      requests_this_month: requestsThisMonth,
      allowed_models: key.allowedModels ?? [],
      requests_30d: requests30d,
      last_used_at: key.lastUsedAt?.toISOString() ?? null,
      created_at: key.createdAt.toISOString(),
      expires_at: null,
      // 兼容旧字段
      quota_limit: key.rateLimitPerMin,
      quota_used: requests30d,
    }
  })
}

/**
 * 创建 API Key
 */
export async function createUserApiKey(
  params: CreateApiKeyParams
): Promise<CreateApiKeyResult> {
  const apiKey = await createApiKey(
    params.userId,
    params.name,
    params.rateLimitPerMin,
    params.monthlyRequestQuota,
    params.allowedModels
  )

  return {
    id: apiKey.id,
    key: apiKey.key,
    name: apiKey.name,
    rate_limit: apiKey.rateLimitPerMin,
    monthly_request_quota: apiKey.monthlyRequestQuota,
    allowed_models: apiKey.allowedModels ?? [],
    status: apiKey.status,
    created_at: apiKey.createdAt.toISOString(),
    last_used_at: apiKey.lastUsedAt?.toISOString() || null,
  }
}

/**
 * 删除 API Key
 */
export async function deleteUserApiKey(keyId: string, userId: string): Promise<void> {
  const existingKey = await findApiKeyById(keyId, userId)

  if (!existingKey) {
    throw new Error('API key not found')
  }

  await revokeApiKey(keyId)
}
