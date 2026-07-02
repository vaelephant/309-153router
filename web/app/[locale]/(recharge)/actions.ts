"use server"

import { createRechargeOrderService } from './domain/recharge.service'
import { createRechargeOrderSchema } from './domain/recharge.schema'
import { RechargeError } from './domain/recharge.errors'
import type { ActionResult } from '@/lib/actions/types'
import type { CreateRechargeOrderResult, PayProvider } from './domain/recharge.types'

/**
 * 创建充值订单 Server Action
 */
export async function createRechargeOrderAction(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult<CreateRechargeOrderResult>> {
  try {
    // 从 FormData 提取参数
    const amount = parseFloat(formData.get('amount') as string)
    const payProvider = formData.get('payProvider') as PayProvider
    const userId = formData.get('userId') as string

    if (!userId) {
      return { ok: false, error: '用户未登录' }
    }

    // Zod 校验
    const validation = createRechargeOrderSchema.safeParse({
      amount,
      payProvider,
    })

    if (!validation.success) {
      return {
        ok: false,
        error: validation.error.errors.map(e => e.message).join(', '),
      }
    }

    const locale = (formData.get('locale') as string) || undefined

    // 调用 Domain Service
    const result = await createRechargeOrderService({
      userId,
      amount: validation.data.amount,
      payProvider: validation.data.payProvider,
      locale,
    })

    return { ok: true, data: result }
  } catch (error) {
    console.error('创建充值订单失败:', error)
    if (error instanceof RechargeError) {
      return { ok: false, error: error.message, code: error.code }
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : '创建充值订单失败',
    }
  }
}
