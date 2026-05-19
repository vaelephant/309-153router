/**
 * API 密钥模块类型定义
 */

export interface ApiKey {
  id: string
  masked_key: string
  name: string | null
  status: string
  rate_limit_per_min: number
  monthly_request_quota: number | null
  requests_this_month: number
  allowed_models: string[]
  requests_30d: number
  last_used_at: string | null
  created_at: string
  expires_at: string | null
  /** @deprecated 使用 rate_limit_per_min */
  quota_limit?: number
  /** @deprecated 使用 requests_30d */
  quota_used?: number
}

export interface CreateApiKeyParams {
  userId: string
  name?: string
  rateLimitPerMin?: number
  monthlyRequestQuota?: number | null
  allowedModels?: string[]
}

export interface CreateApiKeyResult {
  id: string
  key: string
  name: string | null
  rate_limit: number
  monthly_request_quota: number | null
  allowed_models: string[]
  status: string
  created_at: string
  last_used_at: string | null
}
