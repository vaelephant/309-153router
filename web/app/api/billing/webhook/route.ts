import { NextRequest, NextResponse } from 'next/server'
import { handleBillingWebhook } from '@/app/[locale]/(billing)/domain/billing.service'
import { billingWebhookSchema } from '@/app/[locale]/(billing)/domain/billing.schema'
import type { BillingWebhookEnvelope } from '@/app/[locale]/(billing)/domain/billing.types'

/**
 * PayRouter Billing Webhook
 * POST /api/billing/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = billingWebhookSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.errors.map((e) => e.message).join(', ') },
        { status: 200 }
      )
    }

    const result = await handleBillingWebhook(body as BillingWebhookEnvelope)
    return NextResponse.json(
      result.ok ? { ok: true } : { ok: false, error: result.error },
      { status: 200 }
    )
  } catch (error) {
    console.error('Billing webhook 异常:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : '处理异常' },
      { status: 200 }
    )
  }
}
