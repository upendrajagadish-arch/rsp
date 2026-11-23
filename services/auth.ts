import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MembershipRow = Database["public"]["Tables"]["organization_memberships"]["Row"];
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];

export type SessionContext = {
  user: { id: string; email?: string };
  profile: ProfileRow | null;
  memberships: MembershipRow[];
  primaryRole: AppRole | null;
  organization: OrganizationRow | null;
  studentProfile: StudentProfileRow | null;
};

const ROLE_PRIORITY: AppRole[] = ["student", "college_admin", "recruiter"];

function pickPrimaryMembership(memberships: MembershipRow[]): MembershipRow | null {
  const active = memberships.filter((m) => m.is_active);
  if (active.length === 0) return null;
  for (const role of ROLE_PRIORITY) {
    const match = active.find((m) => m.role === role);
    if (match) return match;
  }
  return active[0] ?? null;
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const primaryMembership = pickPrimaryMembership(memberships ?? []);
  let organization: OrganizationRow | null = null;

  if (primaryMembership) {
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", primaryMembership.organization_id)
      .maybeSingle();
    organization = org;
  }

  let studentProfile: StudentProfileRow | null = null;
  const { data: sp } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  studentProfile = sp;

  return {
    user: { id: user.id, email: user.email },
    profile: profile,
    memberships: memberships ?? [],
    primaryRole: primaryMembership?.role ?? null,
    organization,
    studentProfile,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  return ctx;
}

export async function requireRole(role: AppRole, redirectTo = "/"): Promise<SessionContext> {
  const ctx = await requireSession();
  const hasRole = ctx.memberships.some((m) => m.is_active && m.role === role);
  if (!hasRole) {
    redirect(redirectTo);
  }
  return ctx;
}

export function sessionHasRole(ctx: SessionContext, role: AppRole, organizationId?: string) {
  return ctx.memberships.some(
    (m) =>
      m.is_active &&
      m.role === role &&
      (organizationId ? m.organization_id === organizationId : true),
  );
}