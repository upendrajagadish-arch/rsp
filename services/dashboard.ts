import { createClient } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/types/supabase";

export type CertificateStatusCounts = Record<VerificationStatus, number>;

export type DashboardActivityItem = {
  id: string;
  kind: "certificate" | "notification";
  title: string;
  subtitle: string | null;
  occurredAt: string;
  href: string | null;
};

export type StudentDashboardMetrics = {
  certificateCounts: CertificateStatusCounts;
  certificatesTotal: number;
  skillsCount: number;
  projectsCount: number;
  assessmentsCount: number;
  recentActivity: DashboardActivityItem[];
};

const EMPTY_COUNTS = (): CertificateStatusCounts => ({
  pending: 0,
  issuer_verified: 0,
  institution_reviewed: 0,
  unavailable: 0,
  rejected: 0,
  expired: 0,
  revoked: 0,
});

export async function getStudentDashboardMetrics(
  studentProfileId: string,
): Promise<StudentDashboardMetrics> {
  const supabase = await createClient();

  const [
    { data: certificates },
    { count: skillsCount },
    { count: projectsCount },
    { count: assessmentsCount },
    { data: studentProfile },
  ] = await Promise.all([
    supabase
      .from("certificates")
      .select("id, title, verification_status, created_at, pipeline_status")
      .eq("student_profile_id", studentProfileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_skills")
      .select("id", { count: "exact", head: true })
      .eq("student_profile_id", studentProfileId),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("student_profile_id", studentProfileId),
    supabase
      .from("assessment_results")
      .select("id", { count: "exact", head: true })
      .eq("student_profile_id", studentProfileId),
    supabase
      .from("student_profiles")
      .select("user_id")
      .eq("id", studentProfileId)
      .single(),
  ]);

  const certificateCounts = EMPTY_COUNTS();
  for (const cert of certificates ?? []) {
    certificateCounts[cert.verification_status as VerificationStatus] += 1;
  }

  let recentActivity: DashboardActivityItem[] = [];

  const certActivity: DashboardActivityItem[] = (certificates ?? []).slice(0, 8).map((c) => ({
    id: c.id,
    kind: "certificate",
    title: c.title ?? "Uploaded credential",
    subtitle: `${c.verification_status} · ${c.pipeline_status}`,
    occurredAt: c.created_at,
    href: `/credentials/${c.id}`,
  }));

  if (studentProfile?.user_id) {
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, title, body, link, created_at")
      .eq("user_id", studentProfile.user_id)
      .order("created_at", { ascending: false })
      .limit(8);

    const notifActivity: DashboardActivityItem[] = (notifications ?? []).map((n) => ({
      id: n.id,
      kind: "notification",
      title: n.title,
      subtitle: n.body,
      occurredAt: n.created_at,
      href: n.link,
    }));

    recentActivity = [...certActivity, ...notifActivity]
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
      .slice(0, 12);
  } else {
    recentActivity = certActivity;
  }

  return {
    certificateCounts,
    certificatesTotal: certificates?.length ?? 0,
    skillsCount: skillsCount ?? 0,
    projectsCount: projectsCount ?? 0,
    assessmentsCount: assessmentsCount ?? 0,
    recentActivity,
  };
}