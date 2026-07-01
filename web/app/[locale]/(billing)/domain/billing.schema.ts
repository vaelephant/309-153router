import { z } from 'zod'

export const billingWebhookSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  app_id: z.string().min(1),
  biz_user_id: z.string().uuid(),
  occurred_at: z.string().min(1),
  data: z.record(z.unknown()),
  sign: z.string().min(1),
})
