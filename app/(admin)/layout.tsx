import { AdminThemeShell } from "@/components/admin/admin-theme-shell";
import { requireSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(["college_admin"]);
  return (
    <AdminThemeShell
      userName={session.fullName}
      orgName={session.organizationName}
      demo={session.demo}
    >
      {children}
    </AdminThemeShell>
  );
}
