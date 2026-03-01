import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"

export default function BillingPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-1">账单</h1>
          <p className="text-xs text-muted-foreground">
            查看账单和支付信息
          </p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>账单功能开发中...</p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
