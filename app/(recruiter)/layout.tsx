import { AppShell } from "@/components/product/app-shell";
import { requireSession } from "@/lib/auth/session";

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(["recruiter"]);
  return (
    <AppShell
      role="recruiter"
      orgName={session.organizationName}
      userName={session.fullName}
      demo={session.demo}
    >
      {children}
    </AppShell>
  );
}
