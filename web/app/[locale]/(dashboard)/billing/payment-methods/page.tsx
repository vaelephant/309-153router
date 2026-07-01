'use client'

import { DashboardLayout } from '../../components/dashboard-layout'
import { AuthGuard } from '../../../(auth)/components/auth-guard'
import { BillingPaymentMethods } from '../../components/billing-payment-methods'
import { useI18n } from '@/lib/i18n-context'

export default function PaymentMethodsPage() {
  const { t } = useI18n()
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 max-w-lg">
          <div className="mb-6">
            <h1 className="text-lg font-semibold mb-1">{t('billing.paymentMethodsPageTitle')}</h1>
            <p className="text-xs text-muted-foreground">{t('billing.paymentMethodsPageDesc')}</p>
          </div>
          <BillingPaymentMethods />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
