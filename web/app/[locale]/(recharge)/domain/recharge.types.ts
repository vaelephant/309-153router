/**
 * 充值模块类型定义
 */

/** 支付渠道（与 PayRouter pay_provider 一致） */
export type PayProvider = 'WECHAT' | 'ALIPAY' | 'STRIPE'

export const PAY_PROVIDERS: readonly PayProvider[] = ['WECHAT', 'ALIPAY', 'STRIPE'] as const

/** 按渠道选择 PayRouter pay_method */
export function payMethodForProvider(provider: PayProvider): 'NATIVE' | 'H5' {
  return provider === 'STRIPE' ? 'H5' : 'NATIVE'
}

export interface RechargeOrder {
  id: string
  userId: string
  bizOrderNo: string
  gatewayOrderNo: string | null
  amount: number
  payProvider: PayProvider
  status: 'pending' | 'paid' | 'failed' | 'canceled'
  qrcodeUrl: string | null
  processed: boolean
  createdAt: Date
  updatedAt: Date
  paidAt: Date | null
}

export interface CreateRechargeOrderParams {
  userId: string
  amount: number
  payProvider: PayProvider
}

export interface CreateRechargeOrderResult {
  orderId: string
  bizOrderNo: string
  /** 微信/支付宝扫码 URL；Stripe 为空 */
  qrcodeUrl: string
  /** Stripe Checkout 等跳转 URL */
  payUrl?: string
  amount: number
  payProvider: PayProvider
}

export interface PaymentNotifyData {
  biz_order_no: string
  gateway_order_no: string
  status: string
  amount: number
  sign: string
  [key: string]: unknown
}

// 充值金额配置
export const RECHARGE_AMOUNTS = {
  MIN: 1,      // 最小充值金额（元）
  MAX: 10000,  // 最大充值金额（元）
  PRESET: [10, 50, 100], // 固定档位（元）
} as const
