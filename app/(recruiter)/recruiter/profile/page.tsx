import { PageHeader } from "@/components/product/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";

export default async function RecruiterProfilePage() {
  const session = await requireSession(["recruiter"]);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("id", session.userId)
    .maybeSingle();

  const { count: shortlistCount } = await supabase
    .from("recruiter_shortlists")
    .select("id", { count: "exact", head: true })
    .eq("recruiter_user_id", session.userId);

  const name = profile?.full_name ?? session.fullName;

  return (
    <div>
      <PageHeader title="Recruiter profile" description="Your organization-scoped recruiter account." />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--navy)] text-lg font-semibold text-white">
            {initials(name)}
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--navy)]">{name}</p>
            <p className="text-sm text-[var(--muted)]">{profile?.email ?? session.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{session.organizationName}</Badge>
              <Badge variant="info">Recruiter</Badge>
              <Badge variant="outline">{shortlistCount ?? 0} shortlisted</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}