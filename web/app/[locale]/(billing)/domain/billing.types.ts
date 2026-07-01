export type BillingEventType =
  | 'payment_method.attached'
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.payment_failed'
  | 'subscription.updated'
  | 'subscription.canceled'

export interface BillingWebhookEnvelope {
  event_id: string
  event_type: BillingEventType | string
  app_id: string
  biz_user_id: string
  occurred_at: string
  data: Record<string, unknown>
  sign: string
}

export interface SetupIntentResult {
  clientSecret: string
  setupIntentId: string
  customerId: string
}

export interface PaymentMethodView {
  id: string
  paymentMethodId: string
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
}
