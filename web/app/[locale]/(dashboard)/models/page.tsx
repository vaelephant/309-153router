import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { ModelsCatalog } from "../components/models-catalog"

export default function ModelsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <ModelsCatalog />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
