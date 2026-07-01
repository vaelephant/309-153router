import { prisma } from '@/lib/db'

export async function findBillingWebhookEvent(eventId: string) {
  return prisma.billingWebhookEvent.findUnique({ where: { eventId } })
}

export async function createBillingWebhookEvent(eventId: string, eventType: string) {
  return prisma.billingWebhookEvent.create({
    data: { eventId, eventType },
  })
}

export async function replaceUserPaymentMethods(
  userId: string,
  items: Array<{
    gatewayPmId: string
    gatewayCustomerId: string | null
    brand: string | null
    last4: string | null
    expMonth: number | null
    expYear: number | null
    isDefault: boolean
  }>
) {
  await prisma.$transaction(async (tx) => {
    await tx.paymentMethod.deleteMany({ where: { userId, payProvider: 'STRIPE' } })
    if (items.length === 0) return
    await tx.paymentMethod.createMany({
      data: items.map((item) => ({
        userId,
        payProvider: 'STRIPE',
        gatewayPmId: item.gatewayPmId,
        gatewayCustomerId: item.gatewayCustomerId,
        brand: item.brand,
        last4: item.last4,
        expMonth: item.expMonth,
        expYear: item.expYear,
        isDefault: item.isDefault,
      })),
    })
  })
}

export async function listUserPaymentMethods(userId: string) {
  return prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
}
