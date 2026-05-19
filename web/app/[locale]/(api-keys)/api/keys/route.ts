import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import {
  fetchUserApiKeys,
  createUserApiKey,
  deleteUserApiKey,
} from '../../domain/api-key.service'

function getCurrentUserId(request: NextRequest): string | null {
  const userId = request.headers.get('x-user-id')
  return userId
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request)
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json(
      { error: { message: 'Please login to create API keys', type: 'authentication_error' } },
      { status: 401 }
    )
  }

  let body: {
    name?: string
    rateLimitPerMin?: number
    monthlyRequestQuota?: number | null
    allowedModels?: string[]
  } = {}
  try {
    body = await request.json()
  } catch {
  }

  if (body.rateLimitPerMin != null && (body.rateLimitPerMin < 1 || body.rateLimitPerMin > 10000)) {
    return NextResponse.json(
      { error: { message: 'rateLimitPerMin must be between 1 and 10000', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }
  if (body.monthlyRequestQuota != null && body.monthlyRequestQuota < 1) {
    return NextResponse.json(
      { error: { message: 'monthlyRequestQuota must be positive or omitted', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  try {
    const apiKey = await createUserApiKey({
      userId,
      name: body.name?.trim() || undefined,
      rateLimitPerMin: body.rateLimitPerMin,
      monthlyRequestQuota: body.monthlyRequestQuota ?? null,
      allowedModels: Array.isArray(body.allowedModels)
        ? body.allowedModels.map((m) => String(m).trim()).filter(Boolean)
        : undefined,
    })

    return NextResponse.json({
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      rate_limit: apiKey.rate_limit,
      monthly_request_quota: apiKey.monthly_request_quota,
      allowed_models: apiKey.allowed_models,
      status: apiKey.status,
      created_at: apiKey.created_at,
      last_used_at: apiKey.last_used_at,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create API key:', error)
    return NextResponse.json(
      { error: { message: 'Failed to create API key', type: 'internal_error' } },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request)
  
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json(
      { error: { message: 'Please login to view API keys', type: 'authentication_error' } },
      { status: 401 }
    )
  }

  try {
    const apiKeys = await fetchUserApiKeys(userId)
    return NextResponse.json({ data: apiKeys })
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch API keys', type: 'internal_error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const userId = getCurrentUserId(request)
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json(
      { error: { message: 'Please login to manage API keys', type: 'authentication_error' } },
      { status: 401 }
    )
  }

  let body: { key_id: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'Missing key_id in request body', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  try {
    await deleteUserApiKey(body.key_id, userId)
    return NextResponse.json({ success: true, message: 'API key revoked' })
  } catch (error: any) {
    if (error.message === 'API key not found') {
      return NextResponse.json(
        { error: { message: 'API key not found', type: 'not_found' } },
        { status: 404 }
      )
    }
    console.error('Failed to revoke API key:', error)
    return NextResponse.json(
      { error: { message: 'Failed to revoke API key', type: 'internal_error' } },
      { status: 500 }
    )
  }
}
