import { DashboardLayout } from "../components/dashboard-layout"
import { AuthGuard } from "../../(auth)/components/auth-guard"
import { PlaygroundForm } from "../components/playground-form"

export default function PlaygroundPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <PlaygroundForm />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
