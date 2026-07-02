/**
 * 充值模块 Zod 校验 Schema
 */
import { z } from 'zod'
import { RECHARGE_AMOUNTS } from './recharge.types'

/**
 * 创建充值订单参数校验
 */
export const createRechargeOrderSchema = z
  .object({
    amount: z
      .number()
      .max(RECHARGE_AMOUNTS.MAX, `最大充值金额为 ${RECHARGE_AMOUNTS.MAX} 元`)
      .positive('充值金额必须大于 0'),
    payProvider: z.enum(['WECHAT', 'ALIPAY', 'STRIPE'], {
      errorMap: () => ({ message: '支付渠道必须是 WECHAT、ALIPAY 或 STRIPE' }),
    }),
  })
  .superRefine((data, ctx) => {
    const isStripe = data.payProvider === 'STRIPE'
    const min = isStripe ? RECHARGE_AMOUNTS.STRIPE_MIN : RECHARGE_AMOUNTS.MIN
    const max = isStripe ? RECHARGE_AMOUNTS.STRIPE_MAX : RECHARGE_AMOUNTS.MAX
    if (data.amount < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: isStripe
          ? `Stripe 充值金额不能低于 $${RECHARGE_AMOUNTS.STRIPE_MIN}`
          : `最小充值金额为 ${RECHARGE_AMOUNTS.MIN} 元`,
        path: ['amount'],
      })
    }
    if (data.amount > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: isStripe
          ? `Stripe 充值金额不能超过 $${RECHARGE_AMOUNTS.STRIPE_MAX}`
          : `最大充值金额为 ${RECHARGE_AMOUNTS.MAX} 元`,
        path: ['amount'],
      })
    }
  })

/**
 * 支付回调数据校验
 */
export const paymentNotifySchema = z.object({
  biz_order_no: z.string().min(1, '业务订单号不能为空'),
  gateway_order_no: z.string().min(1, '网关订单号不能为空'),
  status: z.string().min(1, '订单状态不能为空'),
  amount: z.number().positive('订单金额必须大于 0'),
  sign: z.string().min(1, '签名不能为空'),
})
