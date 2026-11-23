import { requireSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { demoAdminStudents } from "@/lib/demo/admin-intelligence";
import { getAdminOverview } from "@/services/admin-intelligence";
import { AdminHrDashboard } from "@/components/admin/admin-hr-dashboard";

export default async function AdminOverviewPage() {
  const session = await requireSession(["college_admin"]);
  const metrics = await getAdminOverview(session.organizationId);
  const demo = session.demo || isDemoMode();
  const roster = demo ? demoAdminStudents : [];

  return (
    <AdminHrDashboard
      metrics={metrics}
      userName={session.fullName}
      orgName={session.organizationName}
      demo={demo}
      roster={roster}
    />
  );
}
