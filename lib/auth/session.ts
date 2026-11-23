import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, isDemoMode } from "@/lib/demo/mode";
import { demoSessionByEmail } from "@/lib/demo/users";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/supabase";

export type SessionContext = {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole;
  organizationId: string;
  organizationName: string;
  studentProfileId: string | null;
  passportId: string | null;
  degree: string | null;
  branch: string | null;
  graduationYear: number | null;
  profileCompletion: number;
  sharingEnabled: boolean;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  demo?: boolean;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const jar = await cookies();
  const demoEmail = jar.get(DEMO_COOKIE)?.value;
  if (demoEmail) {
    const session = demoSessionByEmail(demoEmail);
    if (session) return { ...session, demo: true };
  }

  if (isDemoMode()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const { data: membership } = await supabase
      .from("organization_memberships")
      .select("role, organization_id, organizations(name)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return {
        userId: user.id,
        email: profile?.email ?? user.email ?? "",
        fullName: profile?.full_name ?? user.email ?? "User",
        role: "student",
        organizationId: "",
        organizationName: "Unassigned",
        studentProfileId: null,
        passportId: null,
        degree: null,
        branch: null,
        graduationYear: null,
        profileCompletion: 0,
        sharingEnabled: false,
      };
    }

    const org = membership.organizations as unknown as { name: string } | null;

    let student: {
      id: string;
      passport_id: string;
      degree: string | null;
      branch: string | null;
      graduation_year: number | null;
      profile_completion: number;
      sharing_enabled: boolean;
    } | null = null;

    if (membership.role === "student") {
      const { data } = await supabase
        .from("student_profiles")
        .select(
          "id, passport_id, degree, branch, graduation_year, profile_completion, sharing_enabled",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      student = data;
    }

    return {
      userId: user.id,
      email: profile?.email ?? user.email ?? "",
      fullName: profile?.full_name ?? user.email ?? "User",
      role: membership.role,
      organizationId: membership.organization_id,
      organizationName: org?.name ?? "Organization",
      studentProfileId: student?.id ?? null,
      passportId: student?.passport_id ?? null,
      degree: student?.degree ?? null,
      branch: student?.branch ?? null,
      graduationYear: student?.graduation_year ?? null,
      profileCompletion: student?.profile_completion ?? 0,
      sharingEnabled: student?.sharing_enabled ?? false,
    };
  } catch {
    return null;
  }
}

export async function requireSession(roles?: AppRole[]) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (roles && !roles.includes(ctx.role)) {
    if (ctx.role === "college_admin") redirect("/admin");
    if (ctx.role === "recruiter") redirect("/recruiter");
    redirect("/student/profile");
  }
  return ctx;
}
